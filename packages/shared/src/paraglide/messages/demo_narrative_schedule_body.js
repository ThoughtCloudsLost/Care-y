/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Schedule_BodyInputs */

const en_demo_narrative_schedule_body = /** @type {(inputs: Demo_Narrative_Schedule_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Shift scheduling is in development, and the page that will hold the calendar carries a placeholder until it lands. The planned scope is shifts that repeat on a schedule, people assigned to cover them, and a calendar reading day by day, week by week or month by month with coverage marked as complete, partial or absent. [[#failure-states]]
**What runs in its place.** Automatic assignment already asks who is on shift and is answered by a stand-in that reports every member of the queue as available at every hour, so a new case goes to the queue member holding the fewest open cases. The shift line on the overview is filled from fixed values the server returns to every account, which is why its times and initials are identical for everyone and describe nobody's real shift. [Shift summary](#dashboard/shift) covers what that line does with those values. [[#failure-states #client-data]]
**What a schedule would put in the database.** The plan holds shift times and coverage assignments as plaintext in the organization's own schema, on the reasoning that a shift is not case data. The cost of that is a readable record of who works which hours, which is a pattern about people rather than about clients, and it is the one part of this feature worth deciding on before it ships rather than after. [The trust boundary](#deep-dive/the-trust-boundary) covers what the server already holds in the clear. [[#server-holds #metadata]]
**The matching that depends on it.** An intake form can ask a client when they are reachable, and the accepted design matches that answer against shift coverage so a case goes to someone whose hours overlap. A client's availability is treated as sensitive on its own, because when and where someone can talk is a pattern about them, so the plan keeps it out of plaintext storage and does the matching either transiently or in a volunteer's browser. [Submitting an intake](#client-intake/submit) covers what an intake form already collects. [[#privacy #encryption]]
**Who will be able to edit one.** Creating and assigning shifts is planned behind a permission of its own at the manager tier, so an account that can work a shift is not thereby able to change the roster. [The permission system](#deep-dive/the-permission-system) covers how those grants work. [[#permissions]]
**The stand-in in code.** The interface is \`packages/server/src/tickets/shift-provider.ts\`, whose stub returns every queue member, and the caller is \`packages/server/src/tickets/assignment.ts\`. The fixed overview values are marked \`STUB:SHIFT-SCHEDULING\` in \`packages/server/src/routes/tickets.ts\`, and no shift table exists in the tenant migrations yet. [[#failure-states #server-holds]]`)
};

const es_demo_narrative_schedule_body = /** @type {(inputs: Demo_Narrative_Schedule_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La programación de turnos está en desarrollo, y la página que albergará el calendario lleva un marcador de posición hasta que llegue. El alcance previsto son turnos que se repiten según un horario, personas asignadas para cubrirlos y un calendario que se lee por día, por semana o por mes con la cobertura marcada como completa, parcial o ausente. [[#failure-states]]
**Qué funciona mientras tanto.** La asignación automática ya pregunta quién está de turno y le responde un sustituto que declara disponible a cada miembro de la cola a cualquier hora, de modo que un caso nuevo va al miembro de la cola con menos casos abiertos. La línea de turno del resumen se rellena con valores fijos que el servidor devuelve a todas las cuentas, y por eso sus horas y sus iniciales son idénticas para todo el mundo y no describen el turno real de nadie. [Resumen de turno](#dashboard/shift) trata lo que esa línea hace con esos valores. [[#failure-states #client-data]]
**Qué pondría un horario en la base de datos.** El plan guarda las horas de los turnos y las asignaciones de cobertura en texto plano, en el esquema propio de la organización, con el razonamiento de que un turno no son datos de un caso. El coste de eso es un registro legible de quién trabaja a qué horas, que es un patrón sobre personas y no sobre clientes, y es la parte de esta función que conviene decidir antes de que se publique y no después. [La frontera de confianza](#deep-dive/the-trust-boundary) trata lo que el servidor ya guarda en claro. [[#server-holds #metadata]]
**La coincidencia que depende de ello.** Un formulario de admisión puede preguntarle a un cliente cuándo está disponible, y el diseño aceptado compara esa respuesta con la cobertura de turnos para que un caso llegue a alguien cuyas horas se solapen. La disponibilidad de un cliente se trata como sensible por sí sola, porque cuándo y dónde puede hablar alguien es un patrón sobre esa persona, así que el plan la mantiene fuera del almacenamiento en claro y hace la comparación de forma transitoria o en el navegador de una persona voluntaria. [Enviar una admisión](#client-intake/submit) trata lo que un formulario de admisión ya recoge. [[#privacy #encryption]]
**Quién podrá editarlo.** Crear y asignar turnos está previsto detrás de un permiso propio del nivel de gestión, de modo que una cuenta que puede cubrir un turno no queda por ello habilitada para cambiar el cuadrante. [El sistema de permisos](#deep-dive/the-permission-system) trata cómo funcionan esas concesiones. [[#permissions]]
**El sustituto en el código.** La interfaz es \`packages/server/src/tickets/shift-provider.ts\`, cuyo sustituto devuelve a todos los miembros de la cola, y quien la llama es \`packages/server/src/tickets/assignment.ts\`. Los valores fijos del resumen están marcados como \`STUB:SHIFT-SCHEDULING\` en \`packages/server/src/routes/tickets.ts\`, y todavía no existe ninguna tabla de turnos en las migraciones de inquilino. [[#failure-states #server-holds]]`)
};

const en_xa2_demo_narrative_schedule_body = /** @type {(inputs: Demo_Narrative_Schedule_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè plànnèd scòpè fòr shìft schèdùlìng ìs shìfts thàt rèpèàt òn à schèdùlè, àssìgnìng pèòplè tò còvèr thèm, ànd à càlèndàr shòwìng whèrè còvèràgè ìs còmplètè ànd whèrè ìt ìs thìn. Thè shìft sùmmàry òn thè òvèrvìèw pàgè ìs fìllèd fròm plàcèhòldèr vàlùès thàt àrè fìxèd ràthèr thàn dràwn fròm àny schèdùlè, sò ìts tìmès ànd ìnìtìàls àrè ìdèntìcàl fòr èvèry ùsèr ànd dèscrìbè nòbòdy's rèàl shìft. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Shift scheduling is in development, and the page that will hold the calendar carries a placeholder until it lands. The planned scope is shifts that repeat on..." |
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