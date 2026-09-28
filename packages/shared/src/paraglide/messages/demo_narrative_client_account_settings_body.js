/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Account_Settings_BodyInputs */

const en_demo_narrative_client_account_settings_body = /** @type {(inputs: Demo_Narrative_Client_Account_Settings_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The drawer entries for managing an account require a sign-in. A client who opens the page without a password sees nothing in the drawer. [Change password](#client-account/change-password) and [Sign out](#client-account/sign-out) each cover one of the remaining entries. [[#portal #privacy]]
**How is contact information served?** The client's phone number and email address are fetched only when the client opens the contact card. The server reads both from columns encrypted under its operational key, seals them to the channel's public key, and sends the sealed result. Only the client's own device can open it. The operational key holds these values because the server needs to read a number to dial it and an address to send to it. [The trust boundary](#deep-dive/the-trust-boundary) covers where that exception sits and what it exposes. [[#trust-boundary #server-holds]]
**How does a correction work?** The client sends a correction as an encrypted message on the conversation, following the same encryption as any other reply. The organization reads the correction and applies it. Nothing the client submits writes to a stored number or address directly. [Contact correction](#ticket-detail/correction-status) covers what happens on the organization's side. [[#client-data #encryption]]
**The account page and the contact card.** The drawer actions are published through the client shell context in \`packages/client/src/lib/client-shell/\`. The contact card is \`ContactInfoCard.svelte\` and the correction form is \`ContactCorrectionSheet.svelte\` in \`packages/client/src/lib/portal/\`. The server builds the sealed payload in \`getSealedContactInfo\` in \`packages/server/src/portal/contact-exposure-service.ts\`. [[#portal #server-holds]]`)
};

const es_demo_narrative_client_account_settings_body = /** @type {(inputs: Demo_Narrative_Client_Account_Settings_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las opciones de gestión de la cuenta requieren un inicio de sesión. Si se abre la página sin contraseña, el cajón lateral no muestra nada. [Cambiar contraseña](#client-account/change-password) y [Cerrar sesión](#client-account/sign-out) cubren una entrada cada una. [[#portal #privacy]]
**¿Cómo se sirve la información de contacto?** El teléfono y el correo electrónico del cliente se solicitan solo al abrir la tarjeta de contacto. El servidor los lee de columnas cifradas con su clave operativa, los sella con la clave pública del canal y envía el resultado sellado. Solo el dispositivo del cliente puede abrirlo. La clave operativa guarda estos valores porque el servidor necesita leer un número para llamar y una dirección para enviar. [La frontera de confianza](#deep-dive/the-trust-boundary) trata dónde queda esa excepción y qué expone. [[#trust-boundary #server-holds]]
**¿Cómo funciona una corrección?** El cliente envía una corrección como mensaje cifrado en la conversación, con el mismo cifrado que cualquier otra respuesta. La organización la lee y aplica el cambio. El envío no modifica directamente ningún dato de contacto almacenado. [Corrección de contacto](#ticket-detail/correction-status) trata lo que sucede del lado de la organización. [[#client-data #encryption]]
**La página de la cuenta y la tarjeta de contacto.** El cajón publica sus acciones mediante el contexto de armazón del cliente en \`packages/client/src/lib/client-shell/\`. \`ContactInfoCard.svelte\` es la tarjeta y \`ContactCorrectionSheet.svelte\` el formulario de corrección, ambos en \`packages/client/src/lib/portal/\`. El servidor construye el contenido sellado en \`getSealedContactInfo\` en \`packages/server/src/portal/contact-exposure-service.ts\`. [[#portal #server-holds]]`)
};

const en_xa2_demo_narrative_client_account_settings_body = /** @type {(inputs: Demo_Narrative_Client_Account_Settings_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè dràwèr èntrìès fòr mànàgìng àn àccòùnt rèqùìrè à sìgn-ìn. À clìènt whò òpèns thè pàgè wìthòùt à pàsswòrd sèès nòthìng ìn thè dràwèr. [Chàngè pàsswòrd](#clìènt-àccòùnt/chàngè-pàsswòrd) ànd [Sìgn òùt](#clìènt-àccòùnt/sìgn-òùt) èàch còvèr ònè òf thè rèmàìnìng èntrìès. [[#pòrtàl #prìvàcy]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Hòw ìs còntàct ìnfòrmàtìòn sèrvèd? •••••••••••** Thè clìènt's phònè nùmbèr ànd èmàìl àddrèss àrè fètchèd ònly whèn thè clìènt òpèns thè còntàct càrd. Thè sèrvèr rèàds bòth fròm còlùmns èncryptèd ùndèr ìts òpèràtìònàl kèy, sèàls thèm tò thè chànnèl's pùblìc kèy, ànd sènds thè sèàlèd rèsùlt. Ònly thè clìènt's òwn dèvìcè càn òpèn ìt. Thè òpèràtìònàl kèy hòlds thèsè vàlùès bècàùsè thè sèrvèr nèèds tò rèàd à nùmbèr tò dìàl ìt ànd àn àddrèss tò sènd tò ìt. [Thè trùst bòùndàry](#dèèp-dìvè/thè-trùst-bòùndàry) còvèrs whèrè thàt èxcèptìòn sìts ànd whàt ìt èxpòsès. [[#trùst-bòùndàry #sèrvèr-hòlds]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Hòw dòès à còrrèctìòn wòrk? •••••••••** Thè clìènt sènds à còrrèctìòn às àn èncryptèd mèssàgè òn thè cònvèrsàtìòn, fòllòwìng thè sàmè èncryptìòn às àny òthèr rèply. Thè òrgànìzàtìòn rèàds thè còrrèctìòn ànd àpplìès ìt. Nòthìng thè clìènt sùbmìts wrìtès tò à stòrèd nùmbèr òr àddrèss dìrèctly. [Còntàct còrrèctìòn](#tìckèt-dètàìl/còrrèctìòn-stàtùs) còvèrs whàt hàppèns òn thè òrgànìzàtìòn's sìdè. [[#clìènt-dàtà #èncryptìòn]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè àccòùnt pàgè ànd thè còntàct càrd. ••••••••••••** Thè dràwèr àctìòns àrè pùblìshèd thròùgh thè clìènt shèll còntèxt ìn \`pàckàgès/clìènt/src/lìb/clìènt-shèll/\`. Thè còntàct càrd ìs \`CòntàctÌnfòCàrd.svèltè\` ànd thè còrrèctìòn fòrm ìs \`CòntàctCòrrèctìònShèèt.svèltè\` ìn \`pàckàgès/clìènt/src/lìb/pòrtàl/\`. Thè sèrvèr bùìlds thè sèàlèd pàylòàd ìn \`gètSèàlèdCòntàctÌnfò\` ìn \`pàckàgès/sèrvèr/src/pòrtàl/còntàct-èxpòsùrè-sèrvìcè.ts\`. [[#pòrtàl #sèrvèr-hòlds]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The drawer entries for managing an account require a sign-in. A client who opens the page without a password sees nothing in the drawer. [Change password](#c..." |
*
* @param {Demo_Narrative_Client_Account_Settings_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_account_settings_body = /** @type {((inputs?: Demo_Narrative_Client_Account_Settings_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Account_Settings_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_account_settings_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_client_account_settings_body(inputs)
	return en_demo_narrative_client_account_settings_body(inputs)
});