import NextDocument, { Head, Html, Main, NextScript } from "next/document";

/**
 * Document wrapper.
 */
export default class Document extends NextDocument {
	render(): JSX.Element {
		const { locale, defaultLocale } = this.props.__NEXT_DATA__;

		return (
			<Html>
				<Head>
					<link
						rel="preload"
						href="/assets/fonts/inter-var-latin.woff2"
						as="font"
						type="font/woff2"
						crossOrigin="anonymous"
					/>

					<link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />

					<link rel="manifest" href="/site.webmanifest" />

					<meta
						name="google-site-verification"
						content="2E6Gsm_z7nNdzTg7J9dZ-V3QJVDpPerwRtSGF0ulrMA"
					/>
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}
