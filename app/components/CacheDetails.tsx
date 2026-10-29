'use client'

import {
	Box, Chip, Divider, IconButton, Link, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography
} from "@mui/material";
import {Close} from "@mui/icons-material";
import {CacheSelection, DirectorServer} from "@/app/type";

const CHOICE_LABELS = ["1st", "2nd", "3rd"]

const statusColor = (status: string) => {
	switch (status.toLowerCase()) {
		case "ok": return "success"
		case "error":
		case "critical": return "error"
		default: return "warning"
	}
}

const formatArea = (km2: number) => `${(km2 / 1e6).toFixed(1)}M km²`

const Field = ({label, children}: {label: string, children: React.ReactNode}) => (
	<Box sx={{display: "flex", justifyContent: "space-between", gap: 2, py: 0.5}}>
		<Typography variant="body2" color="text.secondary" sx={{whiteSpace: "nowrap"}}>{label}</Typography>
		<Typography variant="body2" sx={{textAlign: "right", overflowWrap: "anywhere"}}>{children}</Typography>
	</Box>
)

interface CacheDetailsProps {
	cache: DirectorServer
	selections: CacheSelection[]
	generatedAt: string
	onClose: () => void
}

const CacheDetails = ({cache, selections, generatedAt, onClose}: CacheDetailsProps) => {

	const landArea = selections.reduce((acc, x) => acc + x.areaKm2, 0)
	const choiceStats = CHOICE_LABELS.map((label, choice) => {
		const picked = selections.filter(x => x.caches[choice]?.name === cache.name)
		const area = picked.reduce((acc, x) => acc + x.areaKm2, 0)
		return {label, points: picked.length, area, share: landArea ? area / landArea : 0}
	})

	return (
		<Paper
			elevation={6}
			square
			sx={{
				position: "absolute",
				top: 0,
				right: 0,
				height: "100%",
				width: {xs: "100%", sm: 380},
				overflowY: "auto",
				zIndex: 10000,
				p: 2.5,
				boxSizing: "border-box",
			}}
		>
			<Box sx={{display: "flex", alignItems: "flex-start", gap: 1}}>
				<Box sx={{flexGrow: 1, minWidth: 0}}>
					<Typography variant="overline" color="text.secondary">Cache</Typography>
					<Typography variant="h6" sx={{wordBreak: "break-word", lineHeight: 1.3}}>{cache.name}</Typography>
				</Box>
				<IconButton onClick={onClose} aria-label="Close cache details">
					<Close />
				</IconButton>
			</Box>

			<Stack direction="row" spacing={1} sx={{mt: 1.5, flexWrap: "wrap", rowGap: 1}}>
				<Chip size="small" label={`Health: ${cache.healthStatus}`} color={statusColor(cache.healthStatus)} />
				<Chip size="small" label={`Status: ${cache.serverStatus}`} color={statusColor(cache.serverStatus)} variant="outlined" />
				{cache.version && <Chip size="small" label={`v${cache.version}`} variant="outlined" />}
				{cache.filtered && <Chip size="small" label={cache.filteredType || "Filtered"} color="warning" variant="outlined" />}
			</Stack>

			<Divider sx={{my: 2}} />

			<Typography variant="subtitle2" gutterBottom>Where it is chosen</Typography>
			<Table size="small">
				<TableHead>
					<TableRow>
						<TableCell sx={{pl: 0}}>Choice</TableCell>
						<TableCell align="right">Points</TableCell>
						<TableCell align="right" sx={{pr: 0}}>Land area</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{choiceStats.map(x => (
						<TableRow key={x.label} sx={{"&:last-child td": {borderBottom: 0}}}>
							<TableCell sx={{pl: 0}}>{x.label}</TableCell>
							<TableCell align="right">{x.points}</TableCell>
							<TableCell align="right" sx={{pr: 0}}>
								{x.points ? `${formatArea(x.area)} · ${(x.share * 100).toFixed(1)}%` : "—"}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<Divider sx={{my: 2}} />

			<Typography variant="subtitle2" gutterBottom>Server</Typography>
			<Field label="Host">{new URL(cache.url).host}</Field>
			{cache.webUrl && (
				<Field label="Web UI">
					<Link href={cache.webUrl} target="_blank" rel="noopener noreferrer">{new URL(cache.webUrl).host}</Link>
				</Field>
			)}
			<Field label="Location">{cache.latitude.toFixed(4)}, {cache.longitude.toFixed(4)}</Field>
			<Field label="IO load">{cache.ioLoad.toFixed(2)}</Field>

			<Divider sx={{my: 2}} />

			<Typography variant="subtitle2" gutterBottom>Namespaces ({cache.namespacePrefixes.length})</Typography>
			<Box sx={{
				maxHeight: 240,
				overflowY: "auto",
				border: 1,
				borderColor: "divider",
				borderRadius: 1,
				px: 1.5,
				py: 1,
				fontFamily: "monospace",
				fontSize: 12,
				lineHeight: 1.7,
			}}>
				{cache.namespacePrefixes.length
					? cache.namespacePrefixes.map(x => <div key={x}>{x}</div>)
					: <Typography variant="body2" color="text.secondary">None advertised</Typography>}
			</Box>

			<Typography variant="caption" color="text.secondary" component="p" sx={{mt: 2}}>
				Snapshot from the director taken when this page was built, {new Date(generatedAt).toLocaleString()}.
			</Typography>
		</Paper>
	)
}

export default CacheDetails;
