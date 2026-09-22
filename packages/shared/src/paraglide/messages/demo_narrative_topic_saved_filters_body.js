/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Saved_Filters_BodyInputs */

const en_demo_narrative_topic_saved_filters_body = /** @type {(inputs: Demo_Narrative_Topic_Saved_Filters_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A combination of active filters can be kept under a name and applied again in one step, either on the device alone or shared with the organization. [[#client-data]]
**Where a saved filter lives.** A private one stays in the browser's own storage on the device that saved it, with no row behind it and no request carrying it. Sharing moves it to a row every account that can view cases lists, and unsharing returns it to the device that unshared it, under a new identifier. What a reader picks from is the two kinds presented as one list. [[#privacy #server-holds]]
**What the server holds for a shared filter.** The name and the filter state, both sealed with the organization key, and the color, the icon, the account that shared it and the time it was shared, all in plaintext. Neither sealed field can be opened by the server, so a database dump shows how many shared views an organization keeps and who made each one, and not what any of them is called or which queue it targets. Both sealed columns are enrolled in the organization key rotation, and a shared filter the browser cannot open while a rotation is in flight is left out of the list rather than presented broken. [How encryption works](#deep-dive/how-encryption-works) covers the organization key and its rotation. [[#encryption #server-holds #metadata]]
**Who can share, unshare and delete.** Listing the shared filters needs permission to view cases, the same permission the ticket list itself needs, so a shared filter reaches every account that can work the list. Sharing, unsharing and deleting belong to the account that shared it: the server refuses those three from anyone else, and they are offered only on a record the account owns. [The permission system](#deep-dive/the-permission-system) covers where that permission comes from. [[#permissions]]
**What stays readable on the device.** A private filter keeps its name sealed with the organization key and its state as readable JSON, so anyone holding the unlocked device can read which queue, priority, assignee and date window a private view targets without reading what it is called. A malformed entry is dropped at load and the rest still load. [Filters](#tickets/filters) covers the dimensions that state can carry. [[#privacy #client-data]]
**The store, the row and the route.** \`packages/client/src/lib/stores/saved-filters.svelte.ts\` keeps the private and shared sets apart and presents them as one, sealing the state on a share and opening it again on load, the row is the tenant migration \`115_saved_filters.ts\`, and the route is \`packages/server/src/routes/saved-filters.ts\` over \`packages/server/src/tickets/saved-filter-service.ts\`. [[#client-data]]`)
};

const es_demo_narrative_topic_saved_filters_body = /** @type {(inputs: Demo_Narrative_Topic_Saved_Filters_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una combinación de filtros activos se puede guardar con un nombre y volver a aplicar en un solo paso, ya sea solo en el dispositivo o compartida con la organización. [[#client-data]]
**Dónde vive un filtro guardado.** Uno privado permanece en el almacenamiento del propio navegador, en el dispositivo que lo guardó, sin ninguna fila detrás y sin ninguna petición que lo lleve. Compartirlo lo traslada a una fila que enumeran todas las cuentas que pueden ver casos, y dejar de compartirlo lo devuelve al dispositivo que lo retiró, con un identificador nuevo. Lo que elige quien lo usa son los dos tipos presentados como una sola lista. [[#privacy #server-holds]]
**Qué guarda el servidor de un filtro compartido.** El nombre y el estado del filtro, ambos sellados con la clave de la organización, y el color, el icono, la cuenta que lo compartió y la fecha en que lo hizo, todo en texto plano. El servidor no puede abrir ninguno de los dos campos sellados, así que un volcado de la base de datos muestra cuántas vistas compartidas conserva una organización y quién creó cada una, y no cómo se llama ninguna ni a qué cola apunta. Las dos columnas selladas están inscritas en la rotación de la clave de la organización, y un filtro compartido que el navegador no pueda abrir mientras hay una rotación en curso queda fuera de la lista en lugar de presentarse roto. [Cómo funciona el cifrado](#deep-dive/how-encryption-works) trata la clave de la organización y su rotación. [[#encryption #server-holds #metadata]]
**Quién puede compartir, dejar de compartir y borrar.** Enumerar los filtros compartidos necesita permiso para ver casos, el mismo permiso que necesita la propia lista de tickets, de modo que un filtro compartido llega a todas las cuentas que pueden trabajar la lista. Compartir, dejar de compartir y borrar pertenecen a la cuenta que lo compartió: el servidor rechaza esas tres acciones de cualquier otra, y solo se ofrecen sobre un registro que la cuenta posee. [El sistema de permisos](#deep-dive/the-permission-system) trata de dónde sale ese permiso. [[#permissions]]
**Qué sigue siendo legible en el dispositivo.** Un filtro privado mantiene su nombre sellado con la clave de la organización y su estado como JSON legible, así que quien tenga el dispositivo desbloqueado puede leer a qué cola, prioridad, persona asignada y ventana de fechas apunta una vista privada sin leer cómo se llama. Una entrada mal formada se descarta al cargar y las demás se cargan igual. [Filtros](#tickets/filters) trata las dimensiones que puede llevar ese estado. [[#privacy #client-data]]
**El almacén, la fila y la ruta.** \`packages/client/src/lib/stores/saved-filters.svelte.ts\` mantiene separados el conjunto privado y el compartido y los presenta como uno solo, sella el estado al compartir y lo vuelve a abrir al cargar, la fila es la migración de inquilino \`115_saved_filters.ts\`, y la ruta es \`packages/server/src/routes/saved-filters.ts\` sobre \`packages/server/src/tickets/saved-filter-service.ts\`. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_saved_filters_body = /** @type {(inputs: Demo_Narrative_Topic_Saved_Filters_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À còmbìnàtìòn òf àctìvè fìltèrs càn bè sàvèd às à nàmèd prèsèt fòr rèùsè. Sàvèd fìltèrs àppèàr às qùìck àccèss bùttòns àbòvè thè fìltèr pìlls.
 •••••••••••••••••••••••••••••••••••••••••••**Pèrsìstèncè. ••••** Ùnshàrèd fìltèrs àrè stòrèd lòcàlly òn thè dèvìcè ànd stày prìvàtè tò thè vòlùntèèr. Shàrìng à fìltèr stòrès ìt às èncryptèd dàtà fòr thè òrgànìzàtìòn, à bàdgè màrks ìt às shàrèd, ànd ìt bècòmès vìsìblè tò tèàmmàtès.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Chìp òptìòns. ••••** Hòldìng à sàvèd fìltèr chìp òpèns ìts òptìòns, whèrè thè fìltèr càn bè dèlètèd òr shàrèd. •••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A combination of active filters can be kept under a name and applied again in one step, either on the device alone or shared with the organization. [[#client..." |
*
* @param {Demo_Narrative_Topic_Saved_Filters_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_saved_filters_body = /** @type {((inputs?: Demo_Narrative_Topic_Saved_Filters_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Saved_Filters_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_saved_filters_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_saved_filters_body(inputs)
	return en_demo_narrative_topic_saved_filters_body(inputs)
});