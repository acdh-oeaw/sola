/**
 * Print html via hidden iframe.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/Guide/Printing#print_an_external_page_without_opening_it
 */
export function printHtml(html: string): void {
	const iframe = document.createElement("iframe");

	function closePrint() {
		/**
		 * Wrap in a timeout, because Firefox (at least in versions before the new print preview dialog)
		 * calls onafterprint too early, so printing fails. Probably similar issue with Safari.
		 */
		setTimeout(() => {
			document.body.removeChild(iframe);
		});
	}

	function setPrint() {
		/* eslint-disable @typescript-eslint/no-non-null-assertion */
		iframe.contentWindow!.onbeforeunload = closePrint;
		iframe.contentWindow!.onafterprint = closePrint;
		iframe.contentWindow!.focus(); /** Required for IE. */
		iframe.contentWindow!.print();
	}

	iframe.onload = setPrint;
	iframe.style.position = "fixed";
	iframe.style.right = "0";
	iframe.style.bottom = "0";
	iframe.style.width = "0";
	iframe.style.height = "0";
	iframe.style.border = "0";
	iframe.srcdoc = html;
	document.body.appendChild(iframe);
}
