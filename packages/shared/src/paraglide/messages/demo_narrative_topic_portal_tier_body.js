/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Portal_Tier_BodyInputs */

const en_demo_narrative_topic_portal_tier_body = /** @type {(inputs: Demo_Narrative_Topic_Portal_Tier_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The tier section reports how the client currently receives messages and offers the controls that change it.
- Setting up a secure link
- Regenerating or revoking one
- Resetting a client account [[#portal #client-data]]
**One channel per client, not per ticket.** The tier is a column on the client record, not the ticket, and the database allows one active channel per client. Regenerating or revoking a channel from any ticket affects every ticket that client has. The four tiers are text and email, secure link, continuation channel carried over from an intake form, and client account. Text and email is where every client starts. [The portal channel lifecycle](#deep-dive/portal-channel-lifecycle) covers how each channel ends. [[#portal #client-data #failure-states]]
**What does the section read?** The tier name, whether the channel has a passphrase, when it was created, and when the client was last seen on it. All four are plaintext columns. The server knows that a client has a private page, whether a passphrase guards it, and how recently it was opened. It cannot read a word that passed through the channel. [[#server-holds #metadata #portal]]
**Who can change a channel?** Setting up, regenerating, and revoking a secure link each require the Manage portal channel permission. Resetting a client account requires the separate Reset client login permission. An organization that has switched secure links off at the policy level gets no setup offer. [Channel policy](#admin-comms/channel-policy) covers that switch. [The permission system](#deep-dive/the-permission-system) covers how grants work. [[#permissions #portal]]
**The tier column and its mutations.** \`communication_tier\` on \`clients\` and the \`portal_channels\` row both come from \`packages/server/src/db/migrations/tenant/001_baseline.ts\`. A partial unique index on \`client_id\` filtered to active status enforces one active channel per client. Revoked rows stay in the table. The mutations are \`upgradeToSecureLink\`, \`regenerateSecureLink\`, and \`revokeSecureLink\` on \`managePortalChannelProcedure\`, and \`resetClientAccount\` on \`resetClientLoginProcedure\`, all in \`packages/server/src/routes/tickets.ts\`. Each mutation writes an audit row carrying the actor identifier and the operation name, with no client identifier. The event types are \`client_tier_changed\`, \`portal_channel_regenerated\`, \`portal_channel_revoked\`, and \`client_account_reset\`. [Secure link setup](#ticket-detail/secure-link) covers what the browser does during a setup. [[#portal #metadata]]`)
};

const es_demo_narrative_topic_portal_tier_body = /** @type {(inputs: Demo_Narrative_Topic_Portal_Tier_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La sección de nivel informa cómo recibe mensajes el cliente actualmente y ofrece los controles para cambiarlo.
- Configurar un enlace seguro
- Regenerar o revocar uno
- Restablecer una cuenta de cliente [[#portal #client-data]]
**Un canal por cliente, no por ticket.** El nivel es una columna en el registro del cliente, no en el ticket, y la base de datos permite un solo canal activo por cliente. Regenerar o revocar un canal desde cualquier ticket afecta a todos los tickets que tenga ese cliente. Los cuatro niveles son texto y correo electrónico, enlace seguro, canal de continuación trasladado desde un formulario de admisión y cuenta de cliente. Texto y correo electrónico es donde comienza cada cliente. [El ciclo de vida del canal del portal](#deep-dive/portal-channel-lifecycle) explica cómo termina cada canal. [[#portal #client-data #failure-states]]
**¿Qué lee la sección?** El nombre del nivel, si el canal tiene frase de paso, cuándo se creó y cuándo el cliente se conectó por última vez. Los cuatro son columnas en texto plano. El servidor sabe que un cliente tiene una página privada, si una frase de paso la protege y cuándo se abrió por última vez. No puede leer una sola palabra que haya pasado por el canal. [[#server-holds #metadata #portal]]
**¿Quién puede cambiar un canal?** Configurar, regenerar y revocar un enlace seguro requieren el permiso Gestionar canal del portal. Restablecer una cuenta de cliente requiere el permiso separado Restablecer acceso del cliente. Una organización que haya desactivado los enlaces seguros a nivel de política no recibe oferta de configuración. [Política de canales](#admin-comms/channel-policy) trata ese interruptor. [El sistema de permisos](#deep-dive/the-permission-system) explica cómo funcionan las concesiones. [[#permissions #portal]]
**La columna de nivel y sus mutaciones.** \`communication_tier\` en \`clients\` y la fila \`portal_channels\` provienen de \`packages/server/src/db/migrations/tenant/001_baseline.ts\`. Un índice único parcial en \`client_id\` filtrado por estado activo garantiza un solo canal activo por cliente. Las filas revocadas permanecen en la tabla. Las mutaciones son \`upgradeToSecureLink\`, \`regenerateSecureLink\` y \`revokeSecureLink\` en \`managePortalChannelProcedure\`, y \`resetClientAccount\` en \`resetClientLoginProcedure\`, todas en \`packages/server/src/routes/tickets.ts\`. Cada mutación escribe una fila de auditoría con el identificador del actor y el nombre de la operación, sin identificador de cliente. Los tipos de evento son \`client_tier_changed\`, \`portal_channel_regenerated\`, \`portal_channel_revoked\` y \`client_account_reset\`. [Configuración de enlace seguro](#ticket-detail/secure-link) trata lo que hace el navegador durante una configuración. [[#portal #metadata]]`)
};

const en_xa2_demo_narrative_topic_portal_tier_body = /** @type {(inputs: Demo_Narrative_Topic_Portal_Tier_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè tìèr sèctìòn rèpòrts hòw thè clìènt cùrrèntly rècèìvès mèssàgès ànd òffèrs thè còntròls thàt chàngè ìt.
- Sèttìng ùp à sècùrè lìnk
- Règènèràtìng òr rèvòkìng ònè
- Rèsèttìng à clìènt àccòùnt [[#pòrtàl #clìènt-dàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Ònè chànnèl pèr clìènt, nòt pèr tìckèt. ••••••••••••** Thè tìèr ìs à còlùmn òn thè clìènt rècòrd, nòt thè tìckèt, ànd thè dàtàbàsè àllòws ònè àctìvè chànnèl pèr clìènt. Règènèràtìng òr rèvòkìng à chànnèl fròm àny tìckèt àffècts èvèry tìckèt thàt clìènt hàs. Thè fòùr tìèrs àrè tèxt ànd èmàìl, sècùrè lìnk, còntìnùàtìòn chànnèl càrrìèd òvèr fròm àn ìntàkè fòrm, ànd clìènt àccòùnt. Tèxt ànd èmàìl ìs whèrè èvèry clìènt stàrts. [Thè pòrtàl chànnèl lìfècyclè](#dèèp-dìvè/pòrtàl-chànnèl-lìfècyclè) còvèrs hòw èàch chànnèl ènds. [[#pòrtàl #clìènt-dàtà #fàìlùrè-stàtès]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè sèctìòn rèàd? •••••••••** Thè tìèr nàmè, whèthèr thè chànnèl hàs à pàssphràsè, whèn ìt wàs crèàtèd, ànd whèn thè clìènt wàs làst sèèn òn ìt. Àll fòùr àrè plàìntèxt còlùmns. Thè sèrvèr knòws thàt à clìènt hàs à prìvàtè pàgè, whèthèr à pàssphràsè gùàrds ìt, ànd hòw rècèntly ìt wàs òpènèd. Ìt cànnòt rèàd à wòrd thàt pàssèd thròùgh thè chànnèl. [[#sèrvèr-hòlds #mètàdàtà #pòrtàl]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whò càn chàngè à chànnèl? ••••••••** Sèttìng ùp, règènèràtìng, ànd rèvòkìng à sècùrè lìnk èàch rèqùìrè thè Mànàgè pòrtàl chànnèl pèrmìssìòn. Rèsèttìng à clìènt àccòùnt rèqùìrès thè sèpàràtè Rèsèt clìènt lògìn pèrmìssìòn. Àn òrgànìzàtìòn thàt hàs swìtchèd sècùrè lìnks òff àt thè pòlìcy lèvèl gèts nò sètùp òffèr. [Chànnèl pòlìcy](#àdmìn-còmms/chànnèl-pòlìcy) còvèrs thàt swìtch. [Thè pèrmìssìòn systèm](#dèèp-dìvè/thè-pèrmìssìòn-systèm) còvèrs hòw grànts wòrk. [[#pèrmìssìòns #pòrtàl]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè tìèr còlùmn ànd ìts mùtàtìòns. •••••••••••** \`còmmùnìcàtìòn_tìèr\` òn \`clìènts\` ànd thè \`pòrtàl_chànnèls\` ròw bòth còmè fròm \`pàckàgès/sèrvèr/src/db/mìgràtìòns/tènànt/001_bàsèlìnè.ts\`. À pàrtìàl ùnìqùè ìndèx òn \`clìènt_ìd\` fìltèrèd tò àctìvè stàtùs ènfòrcès ònè àctìvè chànnèl pèr clìènt. Rèvòkèd ròws stày ìn thè tàblè. Thè mùtàtìòns àrè \`ùpgràdèTòSècùrèLìnk\`, \`règènèràtèSècùrèLìnk\`, ànd \`rèvòkèSècùrèLìnk\` òn \`mànàgèPòrtàlChànnèlPròcèdùrè\`, ànd \`rèsètClìèntÀccòùnt\` òn \`rèsètClìèntLògìnPròcèdùrè\`, àll ìn \`pàckàgès/sèrvèr/src/ròùtès/tìckèts.ts\`. Èàch mùtàtìòn wrìtès àn àùdìt ròw càrryìng thè àctòr ìdèntìfìèr ànd thè òpèràtìòn nàmè, wìth nò clìènt ìdèntìfìèr. Thè èvènt typès àrè \`clìènt_tìèr_chàngèd\`, \`pòrtàl_chànnèl_règènèràtèd\`, \`pòrtàl_chànnèl_rèvòkèd\`, ànd \`clìènt_àccòùnt_rèsèt\`. [Sècùrè lìnk sètùp](#tìckèt-dètàìl/sècùrè-lìnk) còvèrs whàt thè bròwsèr dòès dùrìng à sètùp. [[#pòrtàl #mètàdàtà]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The tier section reports how the client currently receives messages and offers the controls that change it. - Setting up a secure link - Regenerating or revo..." |
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