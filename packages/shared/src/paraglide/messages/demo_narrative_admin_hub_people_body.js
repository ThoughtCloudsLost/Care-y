/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Hub_People_BodyInputs */

const en_demo_narrative_admin_hub_people_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_People_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The people group holds three destinations, the user roster, queue configuration and the client list, and each one appears for an account holding its own permission. [[#permissions]]
**What is encrypted behind each one.** Display names and queue names are organization-key ciphertext the browser opens. A client's alias is too, while their phone number and email address are encrypted with a key the server holds, because the server is what places the call. [Client management](#admin-people/clients) covers that split. [[#encryption #client-data]]
**Why a count can be absent.** The active user count, the queue count and the other figures on the group come from one status query that runs on Manage roles, so an account admitted by a destination permission alone reaches the destination and is given no figure for it. [The permission system](#deep-dive/the-permission-system) covers how those checks are made. [[#permissions #metadata]]`)
};

const es_demo_narrative_admin_hub_people_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_People_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El grupo de personas tiene tres destinos, el directorio de usuarios, la configuración de colas y la lista de clientes, y cada uno aparece para una cuenta que tenga su propio permiso. [[#permissions]]
**Qué está cifrado detrás de cada uno.** Los nombres visibles y los nombres de cola son texto cifrado con la clave de la organización que abre el navegador. El alias de un cliente también lo es, mientras que su número de teléfono y su dirección de correo están cifrados con una clave que tiene el servidor, porque el servidor es quien hace la llamada. [Gestión de clientes](#admin-people/clients) trata esa separación. [[#encryption #client-data]]
**Por qué puede faltar un recuento.** El recuento de cuentas activas, el de colas y las demás cifras del grupo vienen de una sola consulta de estado que depende de Gestionar roles, así que una cuenta admitida solo por el permiso de un destino llega al destino y no recibe ninguna cifra de él. [El sistema de permisos](#deep-dive/the-permission-system) explica cómo se hacen esas comprobaciones. [[#permissions #metadata]]`)
};

const en_xa2_demo_narrative_admin_hub_people_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_People_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè pèòplè gròùp hòlds thrèè dèstìnàtìòns, thè ùsèr ròstèr, qùèùè cònfìgùràtìòn ànd thè clìènt lìst, ànd èàch ònè àppèàrs fòr àn àccòùnt hòldìng ìts òwn pèrmìssìòn. [[#pèrmìssìòns]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt ìs èncryptèd bèhìnd èàch ònè. •••••••••••** Dìsplày nàmès ànd qùèùè nàmès àrè òrgànìzàtìòn-kèy cìphèrtèxt thè bròwsèr òpèns. À clìènt's àlìàs ìs tòò, whìlè thèìr phònè nùmbèr ànd èmàìl àddrèss àrè èncryptèd wìth à kèy thè sèrvèr hòlds, bècàùsè thè sèrvèr ìs whàt plàcès thè càll. [Clìènt mànàgèmènt](#àdmìn-pèòplè/clìènts) còvèrs thàt splìt. [[#èncryptìòn #clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Why à còùnt càn bè àbsènt. ••••••••** Thè àctìvè ùsèr còùnt, thè qùèùè còùnt ànd thè òthèr fìgùrès òn thè gròùp còmè fròm ònè stàtùs qùèry thàt rùns òn Mànàgè ròlès, sò àn àccòùnt àdmìttèd by à dèstìnàtìòn pèrmìssìòn àlònè rèàchès thè dèstìnàtìòn ànd ìs gìvèn nò fìgùrè fòr ìt. [Thè pèrmìssìòn systèm](#dèèp-dìvè/thè-pèrmìssìòn-systèm) còvèrs hòw thòsè chècks àrè màdè. [[#pèrmìssìòns #mètàdàtà]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The people group holds three destinations, the user roster, queue configuration and the client list, and each one appears for an account holding its own perm..." |
*
* @param {Demo_Narrative_Admin_Hub_People_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_hub_people_body = /** @type {((inputs?: Demo_Narrative_Admin_Hub_People_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Hub_People_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_hub_people_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_hub_people_body(inputs)
	return en_demo_narrative_admin_hub_people_body(inputs)
});