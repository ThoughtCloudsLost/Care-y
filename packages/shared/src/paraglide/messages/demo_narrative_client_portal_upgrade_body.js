/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Portal_Upgrade_BodyInputs */

const en_demo_narrative_client_portal_upgrade_body = /** @type {(inputs: Demo_Narrative_Client_Portal_Upgrade_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The portal offers the client two ways to strengthen their link's security.
**Add a passphrase.** The browser generates a random five word passphrase the client can copy or replace. Submitting re-encrypts the portal messages the client can still decrypt under the new credentials and invalidates the original bare link, so anything already unreadable on that device stays that way and nothing readable is lost.
**Create an account.** The browser collects a username and password and derives encryption keys from the password through the same pipeline the sign in page uses. After the account is created the secure link stops working.
**Encryption.** Neither the passphrase nor the account password ever leaves the device. The browser derives encryption keys from either one through local computation combined with a server round trip, and the server cannot learn the passphrase or password from anything it receives.
**When it appears.** A bare link with no passphrase shows both paths, while a link that already has a passphrase shows only the account option and the drawer gains a contact info entry instead.`)
};

const es_demo_narrative_client_portal_upgrade_body = /** @type {(inputs: Demo_Narrative_Client_Portal_Upgrade_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El portal ofrece al cliente dos formas de reforzar la seguridad de su enlace.
**Añadir una frase de paso.** El navegador genera una frase de paso aleatoria de cinco palabras que el cliente puede copiar o reemplazar. Enviar re-cifra los mensajes del portal que el cliente aún puede descifrar bajo las nuevas credenciales e invalida el enlace original sin protección, de modo que lo que ya era ilegible en ese dispositivo sigue siéndolo y nada legible se pierde.
**Crear una cuenta.** El navegador solicita un nombre de usuario y contraseña y deriva claves de cifrado de la contraseña a través del mismo proceso que se usa en la página de inicio de sesión. Después de crear la cuenta el enlace seguro deja de funcionar.
**Cifrado.** Ni la frase de paso ni la contraseña de cuenta salen nunca del dispositivo. El navegador deriva las claves de cifrado a partir de cualquiera de ellas mediante computación local combinada con una ida y vuelta al servidor, y el servidor no puede conocer la frase de paso ni la contraseña a partir de lo que recibe.
**Cuándo aparece.** Un enlace sin frase de paso muestra ambas opciones, mientras que un enlace que ya tiene frase de paso muestra solo la opción de cuenta y el cajón gana una entrada de información de contacto en su lugar.`)
};

const en_xa2_demo_narrative_client_portal_upgrade_body = /** @type {(inputs: Demo_Narrative_Client_Portal_Upgrade_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè pòrtàl òffèrs thè clìènt twò wàys tò strèngthèn thèìr lìnk's sècùrìty.
 •••••••••••••••••••••••**Àdd à pàssphràsè. ••••••** Thè bròwsèr gènèràtès à ràndòm fìvè wòrd pàssphràsè thè clìènt càn còpy òr rèplàcè. Sùbmìttìng rè-èncrypts thè pòrtàl mèssàgès thè clìènt càn stìll dècrypt ùndèr thè nèw crèdèntìàls ànd ìnvàlìdàtès thè òrìgìnàl bàrè lìnk, sò ànythìng àlrèàdy ùnrèàdàblè òn thàt dèvìcè stàys thàt wày ànd nòthìng rèàdàblè ìs lòst.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Crèàtè àn àccòùnt. ••••••** Thè bròwsèr còllècts à ùsèrnàmè ànd pàsswòrd ànd dèrìvès èncryptìòn kèys fròm thè pàsswòrd thròùgh thè sàmè pìpèlìnè thè sìgn ìn pàgè ùsès. Àftèr thè àccòùnt ìs crèàtèd thè sècùrè lìnk stòps wòrkìng.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Èncryptìòn. ••••** Nèìthèr thè pàssphràsè nòr thè àccòùnt pàsswòrd èvèr lèàvès thè dèvìcè. Thè bròwsèr dèrìvès èncryptìòn kèys fròm èìthèr ònè thròùgh lòcàl còmpùtàtìòn còmbìnèd wìth à sèrvèr ròùnd trìp, ànd thè sèrvèr cànnòt lèàrn thè pàssphràsè òr pàsswòrd fròm ànythìng ìt rècèìvès.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whèn ìt àppèàrs. •••••** À bàrè lìnk wìth nò pàssphràsè shòws bòth pàths, whìlè à lìnk thàt àlrèàdy hàs à pàssphràsè shòws ònly thè àccòùnt òptìòn ànd thè dràwèr gàìns à còntàct ìnfò èntry ìnstèàd. ••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The portal offers the client two ways to strengthen their link's security. **Add a passphrase.** The browser generates a random five word passphrase the clie..." |
*
* @param {Demo_Narrative_Client_Portal_Upgrade_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_portal_upgrade_body = /** @type {((inputs?: Demo_Narrative_Client_Portal_Upgrade_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Portal_Upgrade_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_portal_upgrade_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_client_portal_upgrade_body(inputs)
	return en_demo_narrative_client_portal_upgrade_body(inputs)
});