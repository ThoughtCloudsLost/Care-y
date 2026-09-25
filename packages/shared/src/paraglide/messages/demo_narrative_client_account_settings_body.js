/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Account_Settings_BodyInputs */

const en_demo_narrative_client_account_settings_body = /** @type {(inputs: Demo_Narrative_Client_Account_Settings_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`An account's controls become available only once the client has signed in, so the drawer holds nothing for anyone who opens the page without a password. [[#portal #privacy]]
**What the drawer holds.** Four entries after a sign-in: the contact details the organization has on file, a correction to those details, the change-password form and signing out. [Change password](#client-account/change-password) and [Sign out](#client-account/sign-out) cover two of them. [[#portal]]
**How the contact card is served, and what it costs.** The card is fetched only when it is opened, and the server seals the client's phone number and email address to the channel's public key before sending them, so what travels is ciphertext only that session can open. The seal is built from values the server itself can read: a phone number and an email address are held under the server's own operational encryption rather than the organization's end-to-end encryption, because a server that cannot read an address cannot dial or send to it. [The trust boundary](#deep-dive/the-trust-boundary) covers that exception and its limits. [[#trust-boundary #server-holds]]
**Correcting what is on file.** A correction is submitted as a message on the conversation, encrypted like any other reply, so the organization reads it and applies it rather than the client writing to the record directly. Nothing the client submits changes a stored number or address on its own. [Correction status](#ticket-detail/correction-status) covers what the organization does with it. [[#client-data #encryption]]
**The drawer and the card.** The entries are published by the account page through the client shell context in \`packages/client/src/lib/client-shell/\`, the card is \`ContactInfoCard.svelte\` and the correction is \`ContactCorrectionSheet.svelte\` in \`packages/client/src/lib/portal/\`, and the envelope is built by \`getSealedContactInfo\` in \`packages/server/src/portal/contact-exposure-service.ts\`. [[#portal #server-holds]]`)
};

const es_demo_narrative_client_account_settings_body = /** @type {(inputs: Demo_Narrative_Client_Account_Settings_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los controles de una cuenta solo quedan disponibles cuando el cliente ha iniciado sesión, de modo que el cajón lateral no contiene nada para quien abra la página sin contraseña. [[#portal #privacy]]
**Lo que contiene el cajón.** Cuatro entradas tras el inicio de sesión: los datos de contacto que la organización tiene registrados, una corrección de esos datos, el formulario de cambio de contraseña y el cierre de sesión. [Cambiar contraseña](#client-account/change-password) y [Cerrar sesión](#client-account/sign-out) tratan dos de ellas. [[#portal]]
**Cómo se sirve la tarjeta de contacto y qué cuesta.** La tarjeta se solicita solo al abrirla, y el servidor sella el número de teléfono y la dirección de correo del cliente con la clave pública del canal antes de enviarlos, así que lo que viaja es texto cifrado que solo esa sesión puede abrir. El sellado se construye a partir de valores que el propio servidor sí puede leer: un número de teléfono y una dirección de correo se guardan bajo el cifrado operativo del servidor y no bajo el cifrado de extremo a extremo de la organización, porque un servidor que no puede leer una dirección no puede llamar ni escribir a ella. [La frontera de confianza](#deep-dive/the-trust-boundary) trata esa excepción y sus límites. [[#trust-boundary #server-holds]]
**Corregir lo que está registrado.** Una corrección se envía como un mensaje de la conversación, cifrado como cualquier otra respuesta, de modo que la organización la lee y la aplica en lugar de que el cliente escriba directamente en el registro. Nada de lo que el cliente envía cambia por sí solo un número o una dirección almacenados. [Estado de las correcciones](#ticket-detail/correction-status) trata lo que hace la organización con ella. [[#client-data #encryption]]
**El cajón y la tarjeta.** Las entradas las publica la página de la cuenta a través del contexto del armazón de cliente, en \`packages/client/src/lib/client-shell/\`; la tarjeta es \`ContactInfoCard.svelte\` y la corrección es \`ContactCorrectionSheet.svelte\`, en \`packages/client/src/lib/portal/\`; y el sobre lo construye \`getSealedContactInfo\`, en \`packages/server/src/portal/contact-exposure-service.ts\`. [[#portal #server-holds]]`)
};

const en_xa2_demo_narrative_client_account_settings_body = /** @type {(inputs: Demo_Narrative_Client_Account_Settings_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àn àccòùnt's còntròls bècòmè àvàìlàblè ònly òncè thè clìènt hàs sìgnèd ìn, sò thè dràwèr hòlds nòthìng fòr ànyònè whò òpèns thè pàgè wìthòùt à pàsswòrd. [[#pòrtàl #prìvàcy]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt thè dràwèr hòlds. •••••••** Fòùr èntrìès àftèr à sìgn-ìn: thè còntàct dètàìls thè òrgànìzàtìòn hàs òn fìlè, à còrrèctìòn tò thòsè dètàìls, thè chàngè-pàsswòrd fòrm ànd sìgnìng òùt. [Chàngè pàsswòrd](#clìènt-àccòùnt/chàngè-pàsswòrd) ànd [Sìgn òùt](#clìènt-àccòùnt/sìgn-òùt) còvèr twò òf thèm. [[#pòrtàl]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Hòw thè còntàct càrd ìs sèrvèd, ànd whàt ìt còsts. •••••••••••••••** Thè càrd ìs fètchèd ònly whèn ìt ìs òpènèd, ànd thè sèrvèr sèàls thè clìènt's phònè nùmbèr ànd èmàìl àddrèss tò thè chànnèl's pùblìc kèy bèfòrè sèndìng thèm, sò whàt tràvèls ìs cìphèrtèxt ònly thàt sèssìòn càn òpèn. Thè sèàl ìs bùìlt fròm vàlùès thè sèrvèr ìtsèlf càn rèàd: à phònè nùmbèr ànd àn èmàìl àddrèss àrè hèld ùndèr thè sèrvèr's òwn òpèràtìònàl èncryptìòn ràthèr thàn thè òrgànìzàtìòn's ènd-tò-ènd èncryptìòn, bècàùsè à sèrvèr thàt cànnòt rèàd àn àddrèss cànnòt dìàl òr sènd tò ìt. [Thè trùst bòùndàry](#dèèp-dìvè/thè-trùst-bòùndàry) còvèrs thàt èxcèptìòn ànd ìts lìmìts. [[#trùst-bòùndàry #sèrvèr-hòlds]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Còrrèctìng whàt ìs òn fìlè. •••••••••** À còrrèctìòn ìs sùbmìttèd às à mèssàgè òn thè cònvèrsàtìòn, èncryptèd lìkè àny òthèr rèply, sò thè òrgànìzàtìòn rèàds ìt ànd àpplìès ìt ràthèr thàn thè clìènt wrìtìng tò thè rècòrd dìrèctly. Nòthìng thè clìènt sùbmìts chàngès à stòrèd nùmbèr òr àddrèss òn ìts òwn. [Còrrèctìòn stàtùs](#tìckèt-dètàìl/còrrèctìòn-stàtùs) còvèrs whàt thè òrgànìzàtìòn dòès wìth ìt. [[#clìènt-dàtà #èncryptìòn]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè dràwèr ànd thè càrd. ••••••••** Thè èntrìès àrè pùblìshèd by thè àccòùnt pàgè thròùgh thè clìènt shèll còntèxt ìn \`pàckàgès/clìènt/src/lìb/clìènt-shèll/\`, thè càrd ìs \`CòntàctÌnfòCàrd.svèltè\` ànd thè còrrèctìòn ìs \`CòntàctCòrrèctìònShèèt.svèltè\` ìn \`pàckàgès/clìènt/src/lìb/pòrtàl/\`, ànd thè ènvèlòpè ìs bùìlt by \`gètSèàlèdCòntàctÌnfò\` ìn \`pàckàgès/sèrvèr/src/pòrtàl/còntàct-èxpòsùrè-sèrvìcè.ts\`. [[#pòrtàl #sèrvèr-hòlds]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "An account's controls become available only once the client has signed in, so the drawer holds nothing for anyone who opens the page without a password. [[#p..." |
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