/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Schedule_BodyInputs */

const en_demo_narrative_schedule_body = /** @type {(inputs: Demo_Narrative_Schedule_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The schedule page defines recurring shifts with start and end times and assigns volunteers to cover them. A calendar shows coverage by day, week, or month. Each shift reads as complete, partial, or absent. Automatic ticket assignment routes a new case to the on-shift volunteer holding the fewest open cases. [[#schedule #metadata]]
**What does the server store?** [The trust boundary](#deep-dive/the-trust-boundary) covers what the server holds. [[#server-holds #encryption]]
**How does availability matching work?** An intake form can include an availability field that asks a client when they are reachable. The system compares that answer against shift coverage and assigns the case to a volunteer whose hours overlap. A client's availability is sensitive on its own, because when and where someone can talk is a pattern about that person. The comparison runs in the browser or transiently on the server, and the client's answer stays out of plaintext storage. [Submission](#client-intake/submit) covers what an intake form collects. [[#privacy #encryption]]
**Who can edit a schedule?** Creating and assigning shifts requires a separate permission at the manager tier. Viewing shift assignments requires the View own shifts permission. [The permission system](#deep-dive/the-permission-system) covers how permission grants work. [[#permissions]]
**The shift provider and assignment path.** The \`ShiftProvider\` interface in \`packages/server/src/tickets/shift-provider.ts\` returns the on-shift volunteers for a given queue. The caller is \`packages/server/src/tickets/assignment.ts\`, which picks the candidate with the fewest open cases and falls back to the next future shift when nobody is currently on. [[#server-holds #schedule]]`)
};

const es_demo_narrative_schedule_body = /** @type {(inputs: Demo_Narrative_Schedule_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La página de horario define turnos recurrentes con hora de inicio y de fin y asigna voluntarios para cubrirlos. Un calendario muestra la cobertura por día, semana o mes. Cada turno se lee como completo, parcial o ausente. La asignación automática de tickets dirige un caso nuevo al voluntario de turno que tiene menos casos abiertos. [[#schedule #metadata]]
**¿Qué almacena el servidor?** [La frontera de confianza](#deep-dive/the-trust-boundary) trata lo que almacena el servidor. [[#server-holds #encryption]]
**¿Cómo funciona la coincidencia de disponibilidad?** Un formulario de admisión puede incluir un campo de disponibilidad que pregunta al cliente cuándo está localizable. El sistema compara esa respuesta con la cobertura de turnos y asigna el caso a un voluntario cuyas horas se solapen. La disponibilidad de un cliente es sensible por sí sola, porque cuándo y dónde puede hablar alguien es un patrón sobre esa persona. La comparación se ejecuta en el navegador o de forma transitoria en el servidor, y la respuesta del cliente no se guarda en texto plano. [Envío](#client-intake/submit) trata lo que recoge un formulario de admisión. [[#privacy #encryption]]
**¿Quién puede editar un horario?** Crear y asignar turnos requiere un permiso separado en el nivel de gestión. Ver las asignaciones de turno requiere el permiso Ver turnos propios. [El sistema de permisos](#deep-dive/the-permission-system) trata cómo funcionan las concesiones de permisos. [[#permissions]]
**El proveedor de turnos y la ruta de asignación.** La interfaz \`ShiftProvider\` en \`packages/server/src/tickets/shift-provider.ts\` devuelve los voluntarios de turno para una cola dada. Quien la consume es \`packages/server/src/tickets/assignment.ts\`, que elige al candidato con menos casos abiertos y recurre al turno futuro más próximo cuando no hay nadie de turno en ese momento. [[#server-holds #schedule]]`)
};

const en_xa2_demo_narrative_schedule_body = /** @type {(inputs: Demo_Narrative_Schedule_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè schèdùlè pàgè dèfìnès rècùrrìng shìfts wìth stàrt ànd ènd tìmès ànd àssìgns vòlùntèèrs tò còvèr thèm. À càlèndàr shòws còvèràgè by dày, wèèk, òr mònth. Èàch shìft rèàds às còmplètè, pàrtìàl, òr àbsènt. Àùtòmàtìc tìckèt àssìgnmènt ròùtès à nèw càsè tò thè òn-shìft vòlùntèèr hòldìng thè fèwèst òpèn càsès. [[#schèdùlè #mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè sèrvèr stòrè? •••••••••** [Thè trùst bòùndàry](#dèèp-dìvè/thè-trùst-bòùndàry) còvèrs whàt thè sèrvèr hòlds. [[#sèrvèr-hòlds #èncryptìòn]]
 ••••••••••••••••••••••••••••••••••**Hòw dòès àvàìlàbìlìty màtchìng wòrk? •••••••••••** Àn ìntàkè fòrm càn ìnclùdè àn àvàìlàbìlìty fìèld thàt àsks à clìènt whèn thèy àrè rèàchàblè. Thè systèm còmpàrès thàt ànswèr àgàìnst shìft còvèràgè ànd àssìgns thè càsè tò à vòlùntèèr whòsè hòùrs òvèrlàp. À clìènt's àvàìlàbìlìty ìs sènsìtìvè òn ìts òwn, bècàùsè whèn ànd whèrè sòmèònè càn tàlk ìs à pàttèrn àbòùt thàt pèrsòn. Thè còmpàrìsòn rùns ìn thè bròwsèr òr trànsìèntly òn thè sèrvèr, ànd thè clìènt's ànswèr stàys òùt òf plàìntèxt stòràgè. [Sùbmìssìòn](#clìènt-ìntàkè/sùbmìt) còvèrs whàt àn ìntàkè fòrm còllècts. [[#prìvàcy #èncryptìòn]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whò càn èdìt à schèdùlè? ••••••••** Crèàtìng ànd àssìgnìng shìfts rèqùìrès à sèpàràtè pèrmìssìòn àt thè mànàgèr tìèr. Vìèwìng shìft àssìgnmènts rèqùìrès thè Vìèw òwn shìfts pèrmìssìòn. [Thè pèrmìssìòn systèm](#dèèp-dìvè/thè-pèrmìssìòn-systèm) còvèrs hòw pèrmìssìòn grànts wòrk. [[#pèrmìssìòns]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè shìft pròvìdèr ànd àssìgnmènt pàth. ••••••••••••** Thè \`ShìftPròvìdèr\` ìntèrfàcè ìn \`pàckàgès/sèrvèr/src/tìckèts/shìft-pròvìdèr.ts\` rètùrns thè òn-shìft vòlùntèèrs fòr à gìvèn qùèùè. Thè càllèr ìs \`pàckàgès/sèrvèr/src/tìckèts/àssìgnmènt.ts\`, whìch pìcks thè càndìdàtè wìth thè fèwèst òpèn càsès ànd fàlls bàck tò thè nèxt fùtùrè shìft whèn nòbòdy ìs cùrrèntly òn. [[#sèrvèr-hòlds #schèdùlè]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The schedule page defines recurring shifts with start and end times and assigns volunteers to cover them. A calendar shows coverage by day, week, or month. E..." |
*
* @param {Demo_Narrative_Schedule_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_schedule_body = /** @type {((inputs?: Demo_Narrative_Schedule_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Schedule_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_schedule_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_schedule_body(inputs)
	return en_demo_narrative_schedule_body(inputs)
});