/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Shift_BodyInputs */

const en_demo_narrative_dashboard_shift_body = /** @type {(inputs: Demo_Narrative_Dashboard_Shift_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The shift line shows a shift window, time remaining, volunteer initials, and a count of open tickets assigned to the user. Shift scheduling is in development. The shift window and initials are currently just fixed values the server returns to every account, not values read from a roster. [[#failure-states #privacy]]
**Open-ticket count.** The count comes from the same set of tickets the My Tickets section uses. It reflects actual assigned work. The shift window and countdown do not. [My tickets](#dashboard/my-tickets) covers how that set is built. [[#client-data]]
**Countdown and device clock.** The browser computes the countdown against the device clock. The same shift window reads as upcoming, running, or ended depending on when the page is opened. No shift record is stored against any account. A database dump holds no record of who was on and when. [[#server-holds #metadata]]
**Stub source and planned replacement.** The fixed values come from \`dashboardInfo\` in \`packages/server/src/routes/tickets.ts\`, marked \`STUB:SHIFT-SCHEDULING\`. Assignment reads \`packages/server/src/tickets/shift-provider.ts\`, whose stub treats every queue member as available at all times. [Shift scheduling](#schedule/intro) covers the planned scope. [[#failure-states]]`)
};

const es_demo_narrative_dashboard_shift_body = /** @type {(inputs: Demo_Narrative_Dashboard_Shift_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La línea de turno muestra una ventana de turno, el tiempo restante, las iniciales del voluntario y un conteo de tickets abiertos asignados al usuario. La programación de turnos está en desarrollo. La ventana de turno y las iniciales son actualmente solo valores fijos que el servidor devuelve a todas las cuentas, no valores leídos de una lista de guardia. [[#failure-states #privacy]]
**Conteo de tickets abiertos.** El conteo proviene del mismo conjunto de tickets que usa la sección Mis Tickets. Refleja trabajo asignado real. La ventana de turno y la cuenta regresiva no. [Mis tickets](#dashboard/my-tickets) explica cómo se construye ese conjunto. [[#client-data]]
**Cuenta regresiva y reloj del dispositivo.** El navegador calcula la cuenta regresiva contra el reloj del dispositivo. La misma ventana de turno se lee como próxima, en curso o finalizada según el momento en que se abre la página. No se almacena ningún registro de turno contra ninguna cuenta. Un volcado de la base de datos no contiene registro de quién estuvo activo ni cuándo. [[#server-holds #metadata]]
**Código fuente del stub y reemplazo previsto.** Los valores fijos provienen de \`dashboardInfo\` en \`packages/server/src/routes/tickets.ts\`, marcado \`STUB:SHIFT-SCHEDULING\`. La asignación lee \`packages/server/src/tickets/shift-provider.ts\`, cuyo stub trata a cada miembro de la cola como disponible en todo momento. [Programación de turnos](#schedule/intro) cubre el alcance previsto. [[#failure-states]]`)
};

const en_xa2_demo_narrative_dashboard_shift_body = /** @type {(inputs: Demo_Narrative_Dashboard_Shift_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè shìft lìnè shòws à shìft wìndòw, tìmè rèmàìnìng, vòlùntèèr ìnìtìàls, ànd à còùnt òf òpèn tìckèts àssìgnèd tò thè ùsèr. Shìft schèdùlìng ìs ìn dèvèlòpmènt. Thè shìft wìndòw ànd ìnìtìàls àrè cùrrèntly jùst fìxèd vàlùès thè sèrvèr rètùrns tò èvèry àccòùnt, nòt vàlùès rèàd fròm à ròstèr. [[#fàìlùrè-stàtès #prìvàcy]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Òpèn-tìckèt còùnt. ••••••** Thè còùnt còmès fròm thè sàmè sèt òf tìckèts thè My Tìckèts sèctìòn ùsès. Ìt rèflècts àctùàl àssìgnèd wòrk. Thè shìft wìndòw ànd còùntdòwn dò nòt. [My tìckèts](#dàshbòàrd/my-tìckèts) còvèrs hòw thàt sèt ìs bùìlt. [[#clìènt-dàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Còùntdòwn ànd dèvìcè clòck. •••••••••** Thè bròwsèr còmpùtès thè còùntdòwn àgàìnst thè dèvìcè clòck. Thè sàmè shìft wìndòw rèàds às ùpcòmìng, rùnnìng, òr èndèd dèpèndìng òn whèn thè pàgè ìs òpènèd. Nò shìft rècòrd ìs stòrèd àgàìnst àny àccòùnt. À dàtàbàsè dùmp hòlds nò rècòrd òf whò wàs òn ànd whèn. [[#sèrvèr-hòlds #mètàdàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Stùb sòùrcè ànd plànnèd rèplàcèmènt. •••••••••••** Thè fìxèd vàlùès còmè fròm \`dàshbòàrdÌnfò\` ìn \`pàckàgès/sèrvèr/src/ròùtès/tìckèts.ts\`, màrkèd \`STÙB:SHÌFT-SCHÈDÙLÌNG\`. Àssìgnmènt rèàds \`pàckàgès/sèrvèr/src/tìckèts/shìft-pròvìdèr.ts\`, whòsè stùb trèàts èvèry qùèùè mèmbèr às àvàìlàblè àt àll tìmès. [Shìft schèdùlìng](#schèdùlè/ìntrò) còvèrs thè plànnèd scòpè. [[#fàìlùrè-stàtès]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The shift line shows a shift window, time remaining, volunteer initials, and a count of open tickets assigned to the user. Shift scheduling is in development..." |
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