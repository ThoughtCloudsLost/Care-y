/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Shift_BodyInputs */

const en_demo_narrative_dashboard_shift_body = /** @type {(inputs: Demo_Narrative_Dashboard_Shift_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The shift summary shows the active shift window, time remaining, and how many open tickets are assigned to the user. [[#schedule #privacy]]
**Open-ticket count.** The count draws from the same ticket set as the My Tickets section. It reflects actual assigned work. [My tickets](#dashboard/my-tickets) covers how that set is built. [[#client-data]]
**Countdown and device clock.** The countdown runs against the local device clock. Whether a shift reads as upcoming, running, or ended depends on when the user opens the page. [[#metadata]]
**What does the server store?** Shift assignments are encrypted. [Shift scheduling](#schedule/intro) covers the full scheduling surface. [[#server-holds #encryption]]
**Shift summary source.** The dashboard shift data is assembled in \`dashboardInfo\` in \`packages/server/src/routes/tickets.ts\`. Assignment availability reads \`packages/server/src/tickets/shift-provider.ts\`. [[#schedule]]`)
};

const es_demo_narrative_dashboard_shift_body = /** @type {(inputs: Demo_Narrative_Dashboard_Shift_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El resumen de turno muestra la ventana de turno activa, el tiempo restante y cuántos tickets abiertos tiene asignados la persona usuaria. [[#schedule #privacy]]
**Conteo de tickets abiertos.** El conteo proviene del mismo conjunto de tickets de la sección Mis Tickets. Refleja trabajo asignado real. [Mis tickets](#dashboard/my-tickets) trata cómo se construye ese conjunto. [[#client-data]]
**Cuenta regresiva y reloj del dispositivo.** La cuenta regresiva funciona contra el reloj local del dispositivo. Si un turno se lee como próximo, en curso o finalizado depende del momento en que la persona usuaria abre la página. [[#metadata]]
**¿Qué almacena el servidor?** Las asignaciones de turno se cifran. [Programación de turnos](#schedule/intro) trata la superficie completa de programación. [[#server-holds #encryption]]
**Código fuente del resumen de turno.** Los datos del turno en el panel se ensamblan en \`dashboardInfo\` en \`packages/server/src/routes/tickets.ts\`. La disponibilidad de asignación lee \`packages/server/src/tickets/shift-provider.ts\`. [[#schedule]]`)
};

const en_xa2_demo_narrative_dashboard_shift_body = /** @type {(inputs: Demo_Narrative_Dashboard_Shift_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè shìft sùmmàry shòws thè àctìvè shìft wìndòw, tìmè rèmàìnìng, ànd hòw màny òpèn tìckèts àrè àssìgnèd tò thè ùsèr. [[#schèdùlè #prìvàcy]]
 ••••••••••••••••••••••••••••••••••••••••••**Òpèn-tìckèt còùnt. ••••••** Thè còùnt dràws fròm thè sàmè tìckèt sèt às thè My Tìckèts sèctìòn. Ìt rèflècts àctùàl àssìgnèd wòrk. [My tìckèts](#dàshbòàrd/my-tìckèts) còvèrs hòw thàt sèt ìs bùìlt. [[#clìènt-dàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Còùntdòwn ànd dèvìcè clòck. •••••••••** Thè còùntdòwn rùns àgàìnst thè lòcàl dèvìcè clòck. Whèthèr à shìft rèàds às ùpcòmìng, rùnnìng, òr èndèd dèpènds òn whèn thè ùsèr òpèns thè pàgè. [[#mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè sèrvèr stòrè? •••••••••** Shìft àssìgnmènts àrè èncryptèd. [Shìft schèdùlìng](#schèdùlè/ìntrò) còvèrs thè fùll schèdùlìng sùrfàcè. [[#sèrvèr-hòlds #èncryptìòn]]
 •••••••••••••••••••••••••••••••••••••••••**Shìft sùmmàry sòùrcè. •••••••** Thè dàshbòàrd shìft dàtà ìs àssèmblèd ìn \`dàshbòàrdÌnfò\` ìn \`pàckàgès/sèrvèr/src/ròùtès/tìckèts.ts\`. Àssìgnmènt àvàìlàbìlìty rèàds \`pàckàgès/sèrvèr/src/tìckèts/shìft-pròvìdèr.ts\`. [[#schèdùlè]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The shift summary shows the active shift window, time remaining, and how many open tickets are assigned to the user. [[#schedule #privacy]] **Open-ticket cou..." |
*
* @param {Demo_Narrative_Dashboard_Shift_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_shift_body = /** @type {((inputs?: Demo_Narrative_Dashboard_Shift_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Shift_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_shift_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_dashboard_shift_body(inputs)
	return en_demo_narrative_dashboard_shift_body(inputs)
});