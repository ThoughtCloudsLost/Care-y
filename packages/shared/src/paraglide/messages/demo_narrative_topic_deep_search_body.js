/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Deep_Search_BodyInputs */

const en_demo_narrative_topic_deep_search_body = /** @type {(inputs: Demo_Narrative_Topic_Deep_Search_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Searching inside a case matches the words of its entries in the browser, against the text already decrypted there. [[#privacy #client-data #search]]
**What the server is told.** Nothing. No term is sent, no result is reported back, and the query that fetches older entries carries a cursor and a page size and no words, so the server cannot tell a search from ordinary reading. [[#server-holds #privacy]]
**Reaching entries that are not loaded yet.** A term of at least two characters that matches nothing among the loaded entries starts a sweep that pages the rest of the thread in, oldest-ward, and matches each page as it arrives. The count it reports is entries loaded against the case's total, so it measures how much of the thread has been brought in rather than how many matches exist. Changing the term or closing the search stops the sweep. [[#failure-states]]
**What a search cannot see.** An entry whose content has not decrypted is skipped rather than guessed at, so a case with entries the account holds no key for reports fewer matches than the thread contains. In the timeline view the search runs over the timeline's own set, which carries notes and recorded events in full and withholds plain message bodies, so a word spoken in a message is found in the thread view and not in the timeline. [The timeline](#ticket-detail/timeline) covers why those bodies are withheld. [[#keys #failure-states]]
**The matcher and the sweep.** \`searchFollowUps\` in \`packages/client/src/lib/tickets/ticket-detail-utils.ts\` builds the haystack from the decrypt cache and hands it to the shared fuzzy matcher, so a near miss and a different word order still match. The paging loop is \`create-deep-search.svelte.ts\` in \`packages/client/src/lib/composables/ticket-detail/\`. [[#client-data]]`)
};

const es_demo_narrative_topic_deep_search_body = /** @type {(inputs: Demo_Narrative_Topic_Deep_Search_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Buscar dentro de un caso compara las palabras de sus entradas en el navegador, contra el texto ya descifrado allí. [[#privacy #client-data #search]]
**Lo que se le cuenta al servidor.** Nada. No se envía ningún término, no se le informa de ningún resultado, y la consulta que trae entradas más antiguas lleva un cursor y un tamaño de página y ninguna palabra, así que el servidor no puede distinguir una búsqueda de una lectura corriente. [[#server-holds #privacy]]
**Llegar a entradas que aún no están cargadas.** Un término de al menos dos caracteres que no coincide con nada entre las entradas cargadas inicia un barrido que trae el resto del hilo hacia atrás y compara cada página según llega. El recuento que muestra son las entradas cargadas frente al total del caso, así que mide cuánto del hilo se ha traído y no cuántas coincidencias hay. Cambiar el término o cerrar la búsqueda detiene el barrido. [[#failure-states]]
**Lo que una búsqueda no puede ver.** Una entrada cuyo contenido no se ha descifrado se salta en lugar de adivinarse, de modo que un caso con entradas para las que la cuenta no tiene clave muestra menos coincidencias de las que contiene el hilo. En la vista de línea de tiempo la búsqueda recorre el conjunto propio de esa vista, que lleva enteras las notas y los eventos registrados y retiene los cuerpos de los mensajes corrientes, así que una palabra dicha en un mensaje se encuentra en el hilo y no en la línea de tiempo. [La línea de tiempo](#ticket-detail/timeline) trata por qué se retienen esos cuerpos. [[#keys #failure-states]]
**El comparador y el barrido.** \`searchFollowUps\`, en \`packages/client/src/lib/tickets/ticket-detail-utils.ts\`, arma el conjunto de búsqueda a partir de la caché de descifrado y se lo pasa al comparador difuso compartido, de modo que una coincidencia aproximada o un orden distinto de palabras siguen valiendo. El bucle de paginación es \`create-deep-search.svelte.ts\`, en \`packages/client/src/lib/composables/ticket-detail/\`. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_deep_search_body = /** @type {(inputs: Demo_Narrative_Topic_Deep_Search_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèàrchìng ìnsìdè à càsè màtchès thè wòrds òf ìts èntrìès ìn thè bròwsèr, àgàìnst thè tèxt àlrèàdy dècryptèd thèrè. [[#prìvàcy #clìènt-dàtà #sèàrch]]
 •••••••••••••••••••••••••••••••••••••••••••••**Whàt thè sèrvèr ìs tòld. ••••••••** Nòthìng. Nò tèrm ìs sènt, nò rèsùlt ìs rèpòrtèd bàck, ànd thè qùèry thàt fètchès òldèr èntrìès càrrìès à cùrsòr ànd à pàgè sìzè ànd nò wòrds, sò thè sèrvèr cànnòt tèll à sèàrch fròm òrdìnàry rèàdìng. [[#sèrvèr-hòlds #prìvàcy]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Rèàchìng èntrìès thàt àrè nòt lòàdèd yèt. •••••••••••••** À tèrm òf àt lèàst twò chàràctèrs thàt màtchès nòthìng àmòng thè lòàdèd èntrìès stàrts à swèèp thàt pàgès thè rèst òf thè thrèàd ìn, òldèst-wàrd, ànd màtchès èàch pàgè às ìt àrrìvès. Thè còùnt ìt rèpòrts ìs èntrìès lòàdèd àgàìnst thè càsè's tòtàl, sò ìt mèàsùrès hòw mùch òf thè thrèàd hàs bèèn bròùght ìn ràthèr thàn hòw màny màtchès èxìst. Chàngìng thè tèrm òr clòsìng thè sèàrch stòps thè swèèp. [[#fàìlùrè-stàtès]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt à sèàrch cànnòt sèè. ••••••••** Àn èntry whòsè còntènt hàs nòt dècryptèd ìs skìppèd ràthèr thàn gùèssèd àt, sò à càsè wìth èntrìès thè àccòùnt hòlds nò kèy fòr rèpòrts fèwèr màtchès thàn thè thrèàd còntàìns. Ìn thè tìmèlìnè vìèw thè sèàrch rùns òvèr thè tìmèlìnè's òwn sèt, whìch càrrìès nòtès ànd rècòrdèd èvènts ìn fùll ànd wìthhòlds plàìn mèssàgè bòdìès, sò à wòrd spòkèn ìn à mèssàgè ìs fòùnd ìn thè thrèàd vìèw ànd nòt ìn thè tìmèlìnè. [Thè tìmèlìnè](#tìckèt-dètàìl/tìmèlìnè) còvèrs why thòsè bòdìès àrè wìthhèld. [[#kèys #fàìlùrè-stàtès]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè màtchèr ànd thè swèèp. ••••••••** \`sèàrchFòllòwÙps\` ìn \`pàckàgès/clìènt/src/lìb/tìckèts/tìckèt-dètàìl-ùtìls.ts\` bùìlds thè hàystàck fròm thè dècrypt càchè ànd hànds ìt tò thè shàrèd fùzzy màtchèr, sò à nèàr mìss ànd à dìffèrènt wòrd òrdèr stìll màtch. Thè pàgìng lòòp ìs \`crèàtè-dèèp-sèàrch.svèltè.ts\` ìn \`pàckàgès/clìènt/src/lìb/còmpòsàblès/tìckèt-dètàìl/\`. [[#clìènt-dàtà]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Searching inside a case matches the words of its entries in the browser, against the text already decrypted there. [[#privacy #client-data #search]] **What t..." |
*
* @param {Demo_Narrative_Topic_Deep_Search_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_deep_search_body = /** @type {((inputs?: Demo_Narrative_Topic_Deep_Search_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Deep_Search_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_deep_search_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_deep_search_body(inputs)
	return en_demo_narrative_topic_deep_search_body(inputs)
});