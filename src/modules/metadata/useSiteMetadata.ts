import { useContext } from "react";

import type { SiteMetadata } from "@/modules/metadata/SiteMetadataContext";
import { SiteMetadataContext } from "@/modules/metadata/SiteMetadataContext";

/**
 * Returns site metadata for the currently active locale.
 */
export function useSiteMetadata(): SiteMetadata {
	const metadata = useContext(SiteMetadataContext);

	if (metadata === null) {
		throw new Error("`useSiteMetadata` must be nested inside a `SiteMetadataProvider`.");
	}

	return metadata;
}
