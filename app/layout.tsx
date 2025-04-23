import BaseMap from './components/BaseMap';

import './globals.css';

const Layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<html>
			<body>
				<main>
					<BaseMap>{children}</BaseMap>
				</main>
			</body>
		</html>
	)
}

export default Layout;
