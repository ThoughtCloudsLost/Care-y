/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Portal_Tier_BodyInputs */

const en_demo_narrative_topic_portal_tier_body = /** @type {(inputs: Demo_Narrative_Topic_Portal_Tier_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The tier section reports how the client currently receives messages and offers the controls that change it: setting up a secure link, regenerating or revoking one, or resetting a client account. [[#portal #client-data]]
**One channel per client, not per case.** The tier is a column on the client record and the database allows one active channel per client, so regenerating or revoking from one case changes how that client is reached on every case they have. Text and email is the starting tier; a secure link, a continuation channel carried over from an intake form, and a client account are the three the section reports beyond it. [Portal and channel lifecycle](#deep-dive/portal-channel-lifecycle) covers how each one ends. [[#portal #client-data #failure-states]]
**What the section reads.** The tier name, whether the channel has a passphrase, when it was created and when the client was last seen on it. All four are plaintext, so the server knows a client has a private page, whether a passphrase guards it and how recently it was opened, and cannot read a word that passed through it. [[#server-holds #metadata #portal]]
**Who can change a channel.** Setting up, regenerating and revoking a secure link each need permission to manage the portal channel, and resetting a client's account needs permission to reset a client login, which is a separate grant. An organization that has switched secure links off at the policy level gets no setup offer at all. [Channel policy](#admin-comms/channel-policy) covers that switch. [[#permissions #portal]]
**The tier column and its mutations.** \`communication_tier\` on \`clients\` and the \`portal_channels\` row both come from \`090_portal_channels.ts\`, whose partial unique index on the client id is what enforces the single active channel. The mutations are \`upgradeToSecureLink\`, \`regenerateSecureLink\`, \`revokeSecureLink\` and \`resetClientAccount\` in \`packages/server/src/routes/tickets.ts\`, and each tier change writes an audit row naming the operation and no client. [Setting up a secure link](#ticket-detail/secure-link) covers what the browser does during a setup. [[#portal #metadata]]`)
};

const es_demo_narrative_topic_portal_tier_body = /** @type {(inputs: Demo_Narrative_Topic_Portal_Tier_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La sección de nivel indica cómo recibe mensajes el cliente en este momento y ofrece los controles que lo cambian: configurar un enlace seguro, regenerarlo o revocarlo, o restablecer una cuenta de cliente. [[#portal #client-data]]
**Un canal por cliente, no por caso.** El nivel es una columna del registro del cliente y la base de datos admite un solo canal activo por cliente, así que regenerar o revocar desde un caso cambia cómo se llega a ese cliente en todos sus casos. El texto y el correo son el nivel de partida; un enlace seguro, un canal de continuación traído de un formulario de admisión y una cuenta de cliente son los tres que la sección indica más allá de él. [Portal y ciclo de vida del canal](#deep-dive/portal-channel-lifecycle) trata cómo termina cada uno. [[#portal #client-data #failure-states]]
**Lo que lee la sección.** El nombre del nivel, si el canal tiene frase de paso, cuándo se creó y cuándo se vio al cliente por última vez. Los cuatro datos están en texto plano, de modo que el servidor sabe que un cliente tiene una página privada, si una frase de paso la protege y con qué reciente se abrió, y no puede leer ni una palabra de lo que pasó por ella. [[#server-holds #metadata #portal]]
**Quién puede cambiar un canal.** Configurar, regenerar y revocar un enlace seguro necesitan permiso para gestionar el canal del portal, y restablecer la cuenta de un cliente necesita permiso para restablecer el acceso de un cliente, que es una concesión aparte. Una organización que ha desactivado los enlaces seguros en su política no recibe ninguna oferta de configuración. [Política de canales](#admin-comms/channel-policy) trata ese ajuste. [[#permissions #portal]]
**La columna de nivel y sus mutaciones.** \`communication_tier\`, en \`clients\`, y la fila de \`portal_channels\` vienen ambas de \`090_portal_channels.ts\`, cuyo índice único parcial sobre el identificador de cliente es lo que impone el canal activo único. Las mutaciones son \`upgradeToSecureLink\`, \`regenerateSecureLink\`, \`revokeSecureLink\` y \`resetClientAccount\`, en \`packages/server/src/routes/tickets.ts\`, y cada cambio de nivel escribe una fila de auditoría que nombra la operación y a ningún cliente. [Configurar un enlace seguro](#ticket-detail/secure-link) trata lo que hace el navegador durante una configuración. [[#portal #metadata]]`)
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
* | "The tier section reports how the client currently receives messages and offers the controls that change it: setting up a secure link, regenerating or revokin..." |
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