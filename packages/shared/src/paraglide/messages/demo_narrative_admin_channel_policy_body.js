/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Channel_Policy_BodyInputs */

const en_demo_narrative_admin_channel_policy_body = /** @type {(inputs: Demo_Narrative_Admin_Channel_Policy_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The channel policy controls which communication channels the organization makes available.
- SMS
- Email
- Secure links
- Voice
- One-time share links
Every channel starts enabled. Any signed-in user can read the policy. Changing it requires the Manage channel routing permission. [[#telephony #permissions]]
**What does a disabled channel remove from a ticket?** The ticket detail page checks each switch and removes the action for any disabled channel. The voice switch removes the call action, the share-link switch removes the share action, the secure-link switch removes the portal setup offer, the SMS switch removes text delivery, and the email switch removes the option to email the client. A disabled channel hides the action rather than refusing it after the user tries. [[#permissions]]
**What happens to traffic on a disabled channel?** Outbound traffic is refused before the server decrypts any provider credential. Inbound email on a disabled email channel is refused at the same step that refuses an unknown recipient. [[#trust-boundary]]
**What do the switches store?** Each switch is a plaintext boolean on the organization config row. A database dump reveals which channels are active and nothing about the traffic that passed through them. Disabling a channel stops new traffic without removing anything already stored. Re-enabling it restores every action without further configuration. [[#server-holds #metadata]]
**The policy columns and the config service.** The columns are on \`org_config\` in \`packages/server/src/db/migrations/tenant/001_baseline.ts\`, each with a default of true. \`getChannelPolicy\` in \`packages/server/src/org/org-config-service.ts\` reads any absent value as enabled, and the update path writes one flag at a time. The browser query in \`packages/client/src/lib/query/channel-policy.svelte.ts\` answers true for every channel while the policy loads, so the server refusal is the real guard. The same section appears as a step in organization setup. [[#failure-states]]`)
};

const es_demo_narrative_admin_channel_policy_body = /** @type {(inputs: Demo_Narrative_Admin_Channel_Policy_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La política de canales controla qué canales de comunicación habilita la organización.
- SMS
- Correo electrónico
- Enlaces seguros
- Voz
- Enlaces compartidos de un solo uso
Todos los canales comienzan activados. Cualquier persona usuaria con sesión iniciada puede leer la política. Cambiarla requiere el permiso Gestionar enrutamiento de canales. [[#telephony #permissions]]
**¿Qué le quita un canal desactivado a un ticket?** La página de detalle del ticket comprueba cada interruptor y retira la acción de cualquier canal desactivado. El interruptor de voz retira la acción de llamar, el de enlaces compartidos retira la acción de compartir, el de enlaces seguros retira la oferta de configurar el portal, el de SMS retira el envío de texto y el de correo retira la opción de enviar correo al cliente. Un canal desactivado oculta la acción en lugar de rechazarla después de que la persona usuaria lo intente. [[#permissions]]
**¿Qué ocurre con el tráfico en un canal desactivado?** El tráfico saliente se rechaza antes de que el servidor descifre ninguna credencial del proveedor. El correo entrante en un canal de correo desactivado se rechaza en el mismo paso que rechaza a un destinatario desconocido. [[#trust-boundary]]
**¿Qué almacenan los interruptores?** Cada interruptor es un booleano en texto plano en la fila de configuración de la organización. Un volcado de la base de datos revela qué canales están activos y nada sobre el tráfico que pasó por ellos. Desactivar un canal detiene el tráfico nuevo sin eliminar nada de lo ya almacenado. Volver a activarlo restablece todas las acciones sin configuración adicional. [[#server-holds #metadata]]
**Las columnas de la política y el servicio de configuración.** Las columnas están en \`org_config\`, en \`packages/server/src/db/migrations/tenant/001_baseline.ts\`, cada una con un valor por defecto verdadero. \`getChannelPolicy\` en \`packages/server/src/org/org-config-service.ts\` lee como activado cualquier valor ausente, y la ruta de actualización escribe una marca cada vez. La consulta del navegador en \`packages/client/src/lib/query/channel-policy.svelte.ts\` responde verdadero para todos los canales mientras la política carga, de modo que el rechazo del servidor es la protección real. La misma sección aparece como paso en la configuración inicial de la organización. [[#failure-states]]`)
};

const en_xa2_demo_narrative_admin_channel_policy_body = /** @type {(inputs: Demo_Narrative_Admin_Channel_Policy_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè chànnèl pòlìcy còntròls whìch còmmùnìcàtìòn chànnèls thè òrgànìzàtìòn màkès àvàìlàblè.
- SMS
- Èmàìl
- Sècùrè lìnks
- Vòìcè
- Ònè-tìmè shàrè lìnks
Èvèry chànnèl stàrts ènàblèd. Àny sìgnèd-ìn ùsèr càn rèàd thè pòlìcy. Chàngìng ìt rèqùìrès thè Mànàgè chànnèl ròùtìng pèrmìssìòn. [[#tèlèphòny #pèrmìssìòns]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès à dìsàblèd chànnèl rèmòvè fròm à tìckèt? •••••••••••••••** Thè tìckèt dètàìl pàgè chècks èàch swìtch ànd rèmòvès thè àctìòn fòr àny dìsàblèd chànnèl. Thè vòìcè swìtch rèmòvès thè càll àctìòn, thè shàrè-lìnk swìtch rèmòvès thè shàrè àctìòn, thè sècùrè-lìnk swìtch rèmòvès thè pòrtàl sètùp òffèr, thè SMS swìtch rèmòvès tèxt dèlìvèry, ànd thè èmàìl swìtch rèmòvès thè òptìòn tò èmàìl thè clìènt. À dìsàblèd chànnèl hìdès thè àctìòn ràthèr thàn rèfùsìng ìt àftèr thè ùsèr trìès. [[#pèrmìssìòns]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt hàppèns tò tràffìc òn à dìsàblèd chànnèl? ••••••••••••••** Òùtbòùnd tràffìc ìs rèfùsèd bèfòrè thè sèrvèr dècrypts àny pròvìdèr crèdèntìàl. Ìnbòùnd èmàìl òn à dìsàblèd èmàìl chànnèl ìs rèfùsèd àt thè sàmè stèp thàt rèfùsès àn ùnknòwn rècìpìènt. [[#trùst-bòùndàry]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dò thè swìtchès stòrè? •••••••••** Èàch swìtch ìs à plàìntèxt bòòlèàn òn thè òrgànìzàtìòn cònfìg ròw. À dàtàbàsè dùmp rèvèàls whìch chànnèls àrè àctìvè ànd nòthìng àbòùt thè tràffìc thàt pàssèd thròùgh thèm. Dìsàblìng à chànnèl stòps nèw tràffìc wìthòùt rèmòvìng ànythìng àlrèàdy stòrèd. Rè-ènàblìng ìt rèstòrès èvèry àctìòn wìthòùt fùrthèr cònfìgùràtìòn. [[#sèrvèr-hòlds #mètàdàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè pòlìcy còlùmns ànd thè cònfìg sèrvìcè. •••••••••••••** Thè còlùmns àrè òn \`òrg_cònfìg\` ìn \`pàckàgès/sèrvèr/src/db/mìgràtìòns/tènànt/001_bàsèlìnè.ts\`, èàch wìth à dèfàùlt òf trùè. \`gètChànnèlPòlìcy\` ìn \`pàckàgès/sèrvèr/src/òrg/òrg-cònfìg-sèrvìcè.ts\` rèàds àny àbsènt vàlùè às ènàblèd, ànd thè ùpdàtè pàth wrìtès ònè flàg àt à tìmè. Thè bròwsèr qùèry ìn \`pàckàgès/clìènt/src/lìb/qùèry/chànnèl-pòlìcy.svèltè.ts\` ànswèrs trùè fòr èvèry chànnèl whìlè thè pòlìcy lòàds, sò thè sèrvèr rèfùsàl ìs thè rèàl gùàrd. Thè sàmè sèctìòn àppèàrs às à stèp ìn òrgànìzàtìòn sètùp. [[#fàìlùrè-stàtès]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The channel policy controls which communication channels the organization makes available. - SMS - Email - Secure links - Voice - One-time share links Every ..." |
*
* @param {Demo_Narrative_Admin_Channel_Policy_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_channel_policy_body = /** @type {((inputs?: Demo_Narrative_Admin_Channel_Policy_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Channel_Policy_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_channel_policy_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_channel_policy_body(inputs)
	return en_demo_narrative_admin_channel_policy_body(inputs)
});