/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Library_Tools_BodyInputs */

const en_demo_narrative_topic_library_tools_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Tools_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The list can be sorted by creation date, last edit or rating, narrowed by category, rating band, author and a creation date range, and presented in four ways. Sorting and the rating, author and date filters are applied by the server inside the paged query. [[#client-data]]
**What the two rating bands mean.** They read the stored rating, which is a ranking score rather than a vote count: one band takes anything above zero and the other takes half and above. [Helpfulness voting](#library/vote) covers how that score is computed. The date range tests when an article was created, even where the list is sorted by last edit. [[#metadata]]
**What stays on the device.** The view choice and any saved filter combination live in the browser's own storage under keys of their own, never in an account record and never in a request, so the server learns nothing about how anyone reads or narrows the list. A stored combination that does not parse as an article filter is discarded when the list loads, which is what happens to a ticket filter left behind under an older key. [[#privacy #server-holds]]
**What select mode acts on.** Moving articles between categories issues one update per article and stops at the first failure, reporting how many moved before it stopped. Deleting takes permission to delete articles and a confirmation, and it removes the article's attachment blobs before the row and its votes go. [File attachments](#library/attachments) covers what a blob holds. [[#permissions #failure-states]]
**The stores behind the toolbox.** \`kbFilterStore\` in \`packages/client/src/lib/stores/kb-filters.svelte.ts\` maps the pills onto \`kbItemListInputSchema\`, the view mode is \`care-y-kb-view-mode\` in \`kb-view-mode.svelte.ts\`, and the saved combinations are \`care-y:kb-saved-filters\` in \`kb-saved-filters.svelte.ts\`, each record validated against \`kbSavedFilterStateSchema\` on load. [View modes](#tickets/view-modes) covers the same four presentations on the tickets list. [[#client-data]]`)
};

const es_demo_narrative_topic_library_tools_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Tools_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La lista se puede ordenar por fecha de creación, última edición o valoración, acotar por categoría, franja de valoración, autoría y un rango de fechas de creación, y presentar de cuatro maneras. El orden y los filtros de valoración, autoría y fecha los aplica el servidor dentro de la consulta paginada. [[#client-data]]
**Qué significan las dos franjas de valoración.** Leen la valoración almacenada, que es una puntuación de clasificación y no un recuento de votos: una franja toma todo lo que supere el cero y la otra toma desde la mitad. [Votación de utilidad](#library/vote) trata cómo se calcula esa puntuación. El rango de fechas comprueba cuándo se creó un artículo, también cuando la lista está ordenada por última edición. [[#metadata]]
**Lo que se queda en el dispositivo.** La elección de vista y cualquier combinación de filtros guardada viven en el almacenamiento del propio navegador, bajo claves propias, nunca en el registro de una cuenta y nunca en una petición, así que el servidor no aprende nada sobre cómo lee ni acota la lista cada persona. Una combinación almacenada que no se analiza como filtro de artículos se descarta al cargar la lista, que es lo que ocurre con un filtro de tickets dejado bajo una clave anterior. [[#privacy #server-holds]]
**Sobre qué actúa el modo de selección.** Mover artículos entre categorías emite una actualización por artículo y se detiene en el primer fallo, indicando cuántos se movieron antes de detenerse. Eliminar exige permiso para eliminar artículos y una confirmación, y retira los blobs adjuntos del artículo antes de que se vayan la fila y sus votos. [Archivos adjuntos](#library/attachments) trata lo que contiene un blob. [[#permissions #failure-states]]
**Los almacenes de la caja de herramientas.** \`kbFilterStore\`, en \`packages/client/src/lib/stores/kb-filters.svelte.ts\`, traslada las pastillas a \`kbItemListInputSchema\`, el modo de vista es \`care-y-kb-view-mode\`, en \`kb-view-mode.svelte.ts\`, y las combinaciones guardadas son \`care-y:kb-saved-filters\`, en \`kb-saved-filters.svelte.ts\`, con cada registro validado contra \`kbSavedFilterStateSchema\` al cargarse. [Modos de vista](#tickets/view-modes) trata esas mismas cuatro presentaciones en la lista de tickets. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_library_tools_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Tools_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè lìst càn bè sòrtèd by crèàtìòn dàtè, làst èdìt òr ràtìng, nàrròwèd by càtègòry, ràtìng bànd, àùthòr ànd à crèàtìòn dàtè ràngè, ànd prèsèntèd ìn fòùr wàys. Sòrtìng ànd thè ràtìng, àùthòr ànd dàtè fìltèrs àrè àpplìèd by thè sèrvèr ìnsìdè thè pàgèd qùèry. [[#clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt thè twò ràtìng bànds mèàn. ••••••••••** Thèy rèàd thè stòrèd ràtìng, whìch ìs à rànkìng scòrè ràthèr thàn à vòtè còùnt: ònè bànd tàkès ànythìng àbòvè zèrò ànd thè òthèr tàkès hàlf ànd àbòvè. [Hèlpfùlnèss vòtìng](#lìbràry/vòtè) còvèrs hòw thàt scòrè ìs còmpùtèd. Thè dàtè ràngè tèsts whèn àn àrtìclè wàs crèàtèd, èvèn whèrè thè lìst ìs sòrtèd by làst èdìt. [[#mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt stàys òn thè dèvìcè. ••••••••** Thè vìèw chòìcè ànd àny sàvèd fìltèr còmbìnàtìòn lìvè ìn thè bròwsèr's òwn stòràgè ùndèr kèys òf thèìr òwn, nèvèr ìn àn àccòùnt rècòrd ànd nèvèr ìn à rèqùèst, sò thè sèrvèr lèàrns nòthìng àbòùt hòw ànyònè rèàds òr nàrròws thè lìst. À stòrèd còmbìnàtìòn thàt dòès nòt pàrsè às àn àrtìclè fìltèr ìs dìscàrdèd whèn thè lìst lòàds, whìch ìs whàt hàppèns tò à tìckèt fìltèr lèft bèhìnd ùndèr àn òldèr kèy. [[#prìvàcy #sèrvèr-hòlds]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt sèlèct mòdè àcts òn. ••••••••** Mòvìng àrtìclès bètwèèn càtègòrìès ìssùès ònè ùpdàtè pèr àrtìclè ànd stòps àt thè fìrst fàìlùrè, rèpòrtìng hòw màny mòvèd bèfòrè ìt stòppèd. Dèlètìng tàkès pèrmìssìòn tò dèlètè àrtìclès ànd à cònfìrmàtìòn, ànd ìt rèmòvès thè àrtìclè's àttàchmènt blòbs bèfòrè thè ròw ànd ìts vòtès gò. [Fìlè àttàchmènts](#lìbràry/àttàchmènts) còvèrs whàt à blòb hòlds. [[#pèrmìssìòns #fàìlùrè-stàtès]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè stòrès bèhìnd thè tòòlbòx. •••••••••** \`kbFìltèrStòrè\` ìn \`pàckàgès/clìènt/src/lìb/stòrès/kb-fìltèrs.svèltè.ts\` màps thè pìlls òntò \`kbÌtèmLìstÌnpùtSchèmà\`, thè vìèw mòdè ìs \`càrè-y-kb-vìèw-mòdè\` ìn \`kb-vìèw-mòdè.svèltè.ts\`, ànd thè sàvèd còmbìnàtìòns àrè \`càrè-y:kb-sàvèd-fìltèrs\` ìn \`kb-sàvèd-fìltèrs.svèltè.ts\`, èàch rècòrd vàlìdàtèd àgàìnst \`kbSàvèdFìltèrStàtèSchèmà\` òn lòàd. [Vìèw mòdès](#tìckèts/vìèw-mòdès) còvèrs thè sàmè fòùr prèsèntàtìòns òn thè tìckèts lìst. [[#clìènt-dàtà]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The list can be sorted by creation date, last edit or rating, narrowed by category, rating band, author and a creation date range, and presented in four ways..." |
*
* @param {Demo_Narrative_Topic_Library_Tools_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_library_tools_body = /** @type {((inputs?: Demo_Narrative_Topic_Library_Tools_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Library_Tools_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_library_tools_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_library_tools_body(inputs)
	return en_demo_narrative_topic_library_tools_body(inputs)
});