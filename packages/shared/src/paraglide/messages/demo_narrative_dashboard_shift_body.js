/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Shift_BodyInputs */

const en_demo_narrative_dashboard_shift_body = /** @type {(inputs: Demo_Narrative_Dashboard_Shift_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The shift line reports a shift window, the time left in it, and how many open tickets are assigned to the user. Shift scheduling is in development, so both the shift window and the volunteer initials come from fixed values the server returns to every account rather than from a roster. [[#failure-states #privacy]]
**The one number that is real.** The open-ticket count is the same bucket the My tickets section counts, so it tracks the day's work while the times around it do not. [My tickets](#dashboard/my-tickets) covers how that bucket is built. [[#client-data]]
**What the browser does with the fixed times.** The countdown is computed in the browser against the device clock, which is why the same window reads as upcoming, running or ended depending on when the page is opened. No shift is recorded against an account, so a database dump holds no record of who was on and when. [[#server-holds #metadata]]
**The stub and what replaces it.** The values come from \`dashboardInfo\` in \`packages/server/src/routes/tickets.ts\`, marked \`STUB:SHIFT-SCHEDULING\`, and assignment reads \`packages/server/src/tickets/shift-provider.ts\`, whose stub treats every queue member as available at all times. [Shift scheduling](#schedule/intro) covers the planned scope. [[#failure-states]]`)
};

const es_demo_narrative_dashboard_shift_body = /** @type {(inputs: Demo_Narrative_Dashboard_Shift_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La línea de turno indica una franja de turno, el tiempo que queda en ella y cuántos tickets abiertos tiene asignados la persona usuaria. La programación de turnos está en desarrollo, así que tanto la franja del turno como las iniciales de las personas voluntarias salen de valores fijos que el servidor devuelve a todas las cuentas y no de un horario de turnos. [[#failure-states #privacy]]
**El único número que es real.** El recuento de tickets abiertos es el mismo grupo que cuenta la sección Mis tickets, de modo que sigue el trabajo del día mientras las horas que lo rodean no lo hacen. [Mis tickets](#dashboard/my-tickets) trata cómo se forma ese grupo. [[#client-data]]
**Lo que el navegador hace con las horas fijas.** La cuenta regresiva se calcula en el navegador contra el reloj del dispositivo, por lo que la misma franja aparece como próxima, en curso o terminada según el momento en que se abra la página. Ningún turno queda registrado en una cuenta, así que un volcado de la base de datos no guarda constancia de quién estuvo de turno ni cuándo. [[#server-holds #metadata]]
**El sustituto provisional y lo que lo reemplaza.** Los valores vienen de \`dashboardInfo\`, en \`packages/server/src/routes/tickets.ts\`, marcado como \`STUB:SHIFT-SCHEDULING\`, y la asignación lee \`packages/server/src/tickets/shift-provider.ts\`, cuyo sustituto trata a cada miembro de una cola como disponible en todo momento. [Programación de turnos](#schedule/intro) trata el alcance previsto. [[#failure-states]]`)
};

const en_xa2_demo_narrative_dashboard_shift_body = /** @type {(inputs: Demo_Narrative_Dashboard_Shift_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè shìft càrd shòws thè cùrrènt òr ùpcòmìng shìft fòr thè sìgnèd-ìn vòlùntèèr.
 ••••••••••••••••••••••••**Dùrìng à shìft. •••••** Thè càrd dìsplàys stàrt ànd ènd tìmès, à còùntdòwn, ànd thè nùmbèr òf òpèn tìckèts àssìgnèd. Chìps shòw àll vòlùntèèrs cùrrèntly òn shìft.
 ••••••••••••••••••••••••••••••••••••••••••**Bèfòrè òr àftèr à shìft. ••••••••** À còùntdòwn àppèàrs bèfòrè ònè bègìns. Whèn nò shìft ìs àctìvè òr ùpcòmìng, à nòtìcè tàkès ìts plàcè.
 •••••••••••••••••••••••••••••••**Shìft schèdùlìng. ••••••** Thè schèdùlìng fèàtùrè thàt mànàgès shìft crèàtìòn ìs stìll ìn dèvèlòpmènt. •••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The shift line reports a shift window, the time left in it, and how many open tickets are assigned to the user. Shift scheduling is in development, so both t..." |
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