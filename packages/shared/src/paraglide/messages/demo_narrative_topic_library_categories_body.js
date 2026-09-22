/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Library_Categories_BodyInputs */

const en_demo_narrative_topic_library_categories_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Categories_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Every article belongs to exactly one category, and categories are the organization's own vocabulary rather than a fixed set. Creating, renaming, reordering and deleting them takes permission to manage knowledge base categories; reading them comes with permission to view the knowledge base. [[#permissions]]
**What a category row holds.** The name and the optional description are organization-key ciphertext the browser opens. The order, the creation time and the last edit are plaintext, and the order is unique across the organization. A database dump shows how many categories an organization runs, in what order, how old each one is and how many articles sit in each, and none of their names. [How encryption works](#deep-dive/how-encryption-works) covers the organization key. [[#encryption #server-holds #metadata]]
**What deleting one will not do.** A category with articles in it cannot be deleted: the database refuses the delete while any article references it, and the attempt comes back as a conflict rather than taking the articles with it. Moving the articles elsewhere first is what clears the way. [Browsing articles](#library/browse) covers the list the move acts on. [[#failure-states]]
**The category service and its migrations.** \`createKBCategoryService\` in \`packages/server/src/kb/service.ts\` holds the five operations, and reordering runs inside one transaction that parks every affected row on a negative order before writing the final values, so the unique index cannot trip mid-swap. The row is \`037_create_kb_categories.ts\`; \`046_encrypt_kb_category_names.ts\` added the ciphertext name with the order column and dropped the plaintext name. [[#encryption]]`)
};

const es_demo_narrative_topic_library_categories_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Categories_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cada artículo pertenece a una sola categoría, y las categorías son el vocabulario propio de la organización y no un conjunto fijo. Crearlas, renombrarlas, reordenarlas y eliminarlas exige permiso para gestionar las categorías de la base de conocimiento; leerlas llega con el permiso para ver la base de conocimiento. [[#permissions]]
**Lo que guarda la fila de una categoría.** El nombre y la descripción opcional son texto cifrado con la clave de la organización que abre el navegador. El orden, la fecha de creación y la última edición están en texto plano, y el orden es único en toda la organización. Un volcado de la base de datos muestra cuántas categorías tiene una organización, en qué orden, qué antigüedad tiene cada una y cuántos artículos hay en cada una, y ninguno de sus nombres. [Cómo funciona el cifrado](#deep-dive/how-encryption-works) trata la clave de la organización. [[#encryption #server-holds #metadata]]
**Lo que eliminar una categoría no hará.** Una categoría con artículos dentro no se puede eliminar: la base de datos rechaza el borrado mientras algún artículo la referencie, y el intento vuelve como conflicto en lugar de llevarse los artículos por delante. Mover antes esos artículos a otra parte es lo que despeja el camino. [Navegar artículos](#library/browse) trata la lista sobre la que actúa ese movimiento. [[#failure-states]]
**El servicio de categorías y sus migraciones.** \`createKBCategoryService\`, en \`packages/server/src/kb/service.ts\`, reúne las cinco operaciones, y el reordenamiento se ejecuta dentro de una única transacción que deja cada fila afectada en un orden negativo antes de escribir los valores finales, de modo que el índice único no pueda saltar a mitad del intercambio. La fila es \`037_create_kb_categories.ts\`; \`046_encrypt_kb_category_names.ts\` añadió el nombre cifrado junto con la columna de orden y eliminó el nombre en claro. [[#encryption]]`)
};

const en_xa2_demo_narrative_topic_library_categories_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Categories_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àdmìnìstràtòrs òrgànìzè thè knòwlèdgè lìbràry ìntò càtègòrìès. Èàch càtègòry nàmè ìs èncryptèd wìth thè òrgànìzàtìòn kèy bèfòrè stòràgè, sò à dàtàbàsè brèàch rèvèàls nò càtègòry nàmès.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Pèrmìssìòns. ••••** Ònly àdmìnìstràtòrs càn crèàtè, rènàmè, òr dèlètè càtègòrìès, whìlè àll vòlùntèèrs càn bròwsè àrtìclès wìthìn àny càtègòry. ••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Every article belongs to exactly one category, and categories are the organization's own vocabulary rather than a fixed set. Creating, renaming, reordering a..." |
*
* @param {Demo_Narrative_Topic_Library_Categories_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_library_categories_body = /** @type {((inputs?: Demo_Narrative_Topic_Library_Categories_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Library_Categories_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_library_categories_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_library_categories_body(inputs)
	return en_demo_narrative_topic_library_categories_body(inputs)
});