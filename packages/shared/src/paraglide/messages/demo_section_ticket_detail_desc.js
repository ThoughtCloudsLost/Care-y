/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Ticket_Detail_DescInputs */

const en_demo_section_ticket_detail_desc = /** @type {(inputs: Demo_Section_Ticket_Detail_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Surfaces what is recorded on one ticket, from client contact on each channel and volunteer notes to attached files and actions that change the ticket's state. A client's messages and the notes volunteers wrote about the ticket are sealed under the ticket's key; the server keeps queue, priority, status, and timestamps in plaintext. The browser decrypts all content locally before the page renders. The page switches between a [unified case thread](#ticket-detail/conversation) and a timeline.`)
};

const es_demo_section_ticket_detail_desc = /** @type {(inputs: Demo_Section_Ticket_Detail_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Presenta lo registrado en un ticket, desde el contacto del cliente en cada canal y las notas de las personas voluntarias hasta los archivos adjuntos y las acciones que cambian el estado del ticket. Los mensajes del cliente y las notas que las personas voluntarias escribieron sobre el ticket se sellan con la clave del ticket; el servidor conserva la cola, la prioridad, el estado y las marcas de tiempo en texto plano. El navegador descifra todo el contenido localmente antes de mostrar la página. La página alterna entre un [hilo de caso unificado](#ticket-detail/conversation) y una línea de tiempo.`)
};

const en_xa2_demo_section_ticket_detail_desc = /** @type {(inputs: Demo_Section_Ticket_Detail_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sùrfàcès whàt ìs rècòrdèd òn ònè tìckèt, fròm clìènt còntàct òn èàch chànnèl ànd vòlùntèèr nòtès tò àttàchèd fìlès ànd àctìòns thàt chàngè thè tìckèt's stàtè. À clìènt's mèssàgès ànd thè nòtès vòlùntèèrs wròtè àbòùt thè tìckèt àrè sèàlèd ùndèr thè tìckèt's kèy; thè sèrvèr kèèps qùèùè, prìòrìty, stàtùs, ànd tìmèstàmps ìn plàìntèxt. Thè bròwsèr dècrypts àll còntènt lòcàlly bèfòrè thè pàgè rèndèrs. Thè pàgè swìtchès bètwèèn à [ùnìfìèd càsè thrèàd](#tìckèt-dètàìl/cònvèrsàtìòn) ànd à tìmèlìnè. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Surfaces what is recorded on one ticket, from client contact on each channel and volunteer notes to attached files and actions that change the ticket's state..." |
*
* @param {Demo_Section_Ticket_Detail_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_ticket_detail_desc = /** @type {((inputs?: Demo_Section_Ticket_Detail_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Ticket_Detail_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_ticket_detail_desc(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_ticket_detail_desc(inputs)
	return en_demo_section_ticket_detail_desc(inputs)
});