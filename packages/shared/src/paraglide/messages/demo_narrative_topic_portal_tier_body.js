/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Portal_Tier_BodyInputs */

const en_demo_narrative_topic_portal_tier_body = /** @type {(inputs: Demo_Narrative_Topic_Portal_Tier_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The tier section in the case panel shows how the client currently receives messages and provides controls for upgrading or managing that channel.
**Tier levels.** A ticket starts at the base tier, where the client is reachable by SMS or email. From there a volunteer can set up a secure link, which gives the client a browser portal tied to a single URL. A ticket created through an intake form shows a continuation channel instead, carrying the client's public key from submission. The client can later create a durable account that persists across sessions.
**Set up.** Tapping the setup button opens the secure link sheet, which walks through generating the link. When a passphrase is enabled, a chip appears next to the tier label so the volunteer can see at a glance whether the link is passphrase protected.
**Regenerate and revoke.** Once a secure link or continuation channel is active, regenerate and revoke controls replace the setup button. Regenerating creates a new link and invalidates the old one. Revoking drops the channel entirely and returns the ticket to the base tier after a confirmation dialog.
**Account reset.** When the client has created an account, the tier section shows a reset button that deletes the account after a confirmation dialog.`)
};

const es_demo_narrative_topic_portal_tier_body = /** @type {(inputs: Demo_Narrative_Topic_Portal_Tier_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La sección de nivel en el panel del caso muestra cómo el cliente recibe mensajes actualmente y ofrece controles para actualizar o gestionar ese canal.
**Niveles.** Un ticket comienza en el nivel base, donde el cliente es accesible por SMS o correo electrónico. Desde ahí un voluntario puede configurar un enlace seguro, que da al cliente un portal en el navegador vinculado a una sola URL. Un ticket creado a través de un formulario de admisión muestra un canal de continuación en su lugar, llevando la clave pública del cliente desde el envío. El cliente puede luego crear una cuenta duradera que persiste entre sesiones.
**Configurar.** Tocar el botón de configuración abre la hoja de enlace seguro, que guía a través de la generación del enlace. Cuando se habilita una frase de paso, aparece una insignia junto a la etiqueta del nivel para que el voluntario pueda ver de un vistazo si el enlace está protegido con frase de paso.
**Regenerar y revocar.** Una vez que un enlace seguro o canal de continuación está activo, los controles de regenerar y revocar reemplazan el botón de configuración. Regenerar crea un nuevo enlace e invalida el anterior. Revocar elimina el canal por completo y devuelve el ticket al nivel base después de un diálogo de confirmación.
**Restablecer cuenta.** Cuando el cliente ha creado una cuenta, la sección de nivel muestra un botón de restablecer que elimina la cuenta después de un diálogo de confirmación.`)
};

const en_xa2_demo_narrative_topic_portal_tier_body = /** @type {(inputs: Demo_Narrative_Topic_Portal_Tier_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè tìèr sèctìòn ìn thè càsè pànèl shòws hòw thè clìènt cùrrèntly rècèìvès mèssàgès ànd pròvìdès còntròls fòr ùpgràdìng òr mànàgìng thàt chànnèl.
 ••••••••••••••••••••••••••••••••••••••••••••**Tìèr lèvèls. ••••** À tìckèt stàrts àt thè bàsè tìèr, whèrè thè clìènt ìs rèàchàblè by SMS òr èmàìl. Fròm thèrè à vòlùntèèr càn sèt ùp à sècùrè lìnk, whìch gìvès thè clìènt à bròwsèr pòrtàl tìèd tò à sìnglè ÙRL. À tìckèt crèàtèd thròùgh àn ìntàkè fòrm shòws à còntìnùàtìòn chànnèl ìnstèàd, càrryìng thè clìènt's pùblìc kèy fròm sùbmìssìòn. Thè clìènt càn làtèr crèàtè à dùràblè àccòùnt thàt pèrsìsts àcròss sèssìòns.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Sèt ùp. •••** Tàppìng thè sètùp bùttòn òpèns thè sècùrè lìnk shèèt, whìch wàlks thròùgh gènèràtìng thè lìnk. Whèn à pàssphràsè ìs ènàblèd, à chìp àppèàrs nèxt tò thè tìèr làbèl sò thè vòlùntèèr càn sèè àt à glàncè whèthèr thè lìnk ìs pàssphràsè pròtèctèd.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Règènèràtè ànd rèvòkè. •••••••** Òncè à sècùrè lìnk òr còntìnùàtìòn chànnèl ìs àctìvè, règènèràtè ànd rèvòkè còntròls rèplàcè thè sètùp bùttòn. Règènèràtìng crèàtès à nèw lìnk ànd ìnvàlìdàtès thè òld ònè. Rèvòkìng dròps thè chànnèl èntìrèly ànd rètùrns thè tìckèt tò thè bàsè tìèr àftèr à cònfìrmàtìòn dìàlòg.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Àccòùnt rèsèt. •••••** Whèn thè clìènt hàs crèàtèd àn àccòùnt, thè tìèr sèctìòn shòws à rèsèt bùttòn thàt dèlètès thè àccòùnt àftèr à cònfìrmàtìòn dìàlòg. ••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The tier section in the case panel shows how the client currently receives messages and provides controls for upgrading or managing that channel. **Tier leve..." |
*
* @param {Demo_Narrative_Topic_Portal_Tier_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_portal_tier_body = /** @type {((inputs?: Demo_Narrative_Topic_Portal_Tier_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Portal_Tier_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_portal_tier_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_portal_tier_body(inputs)
	return en_demo_narrative_topic_portal_tier_body(inputs)
});