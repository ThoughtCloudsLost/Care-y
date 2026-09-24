/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Portal_Passphrase_BodyInputs */

const en_demo_narrative_client_portal_passphrase_body = /** @type {(inputs: Demo_Narrative_Client_Portal_Passphrase_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`When a secure link was created with a passphrase, the portal page shows a passphrase form before the thread, and the visitor enters the five word passphrase they received on a verification call.
**How it works.** The browser derives encryption keys from the passphrase through a deliberately slow process that combines local computation with a server round trip, and a progress indicator appears during each step because the cost is the defense.
**If it fails.** If the passphrase is wrong the page shows an error and the visitor can try again, but every attempt must pass through the same server round trip so someone who has the link alone cannot test guesses on their own device.`)
};

const es_demo_narrative_client_portal_passphrase_body = /** @type {(inputs: Demo_Narrative_Client_Portal_Passphrase_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuando un enlace seguro se creó con una frase de paso, la página del portal muestra un formulario antes del hilo, y el visitante ingresa la frase de paso de cinco palabras que recibió en una llamada de verificación.
**Cómo funciona.** El navegador deriva las claves de cifrado a partir de la frase de paso mediante un proceso deliberadamente lento que combina computación local con una ida y vuelta al servidor, y un indicador de progreso aparece durante cada paso porque el costo es la defensa.
**Si falla.** Si la frase de paso es incorrecta la página muestra un error y el visitante puede intentar de nuevo, pero cada intento debe pasar por la misma ida y vuelta al servidor, por lo que alguien que solo posee el enlace no puede probar combinaciones en su propio dispositivo.`)
};

const en_xa2_demo_narrative_client_portal_passphrase_body = /** @type {(inputs: Demo_Narrative_Client_Portal_Passphrase_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Whèn à sècùrè lìnk wàs crèàtèd wìth à pàssphràsè, thè pòrtàl pàgè shòws à pàssphràsè fòrm bèfòrè thè thrèàd, ànd thè vìsìtòr èntèrs thè fìvè wòrd pàssphràsè thèy rècèìvèd òn à vèrìfìcàtìòn càll.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Hòw ìt wòrks. ••••** Thè bròwsèr dèrìvès èncryptìòn kèys fròm thè pàssphràsè thròùgh à dèlìbèràtèly slòw pròcèss thàt còmbìnès lòcàl còmpùtàtìòn wìth à sèrvèr ròùnd trìp, ànd à prògrèss ìndìcàtòr àppèàrs dùrìng èàch stèp bècàùsè thè còst ìs thè dèfènsè.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Ìf ìt fàìls. ••••** Ìf thè pàssphràsè ìs wròng thè pàgè shòws àn èrròr ànd thè vìsìtòr càn try àgàìn, bùt èvèry àttèmpt mùst pàss thròùgh thè sàmè sèrvèr ròùnd trìp sò sòmèònè whò hàs thè lìnk àlònè cànnòt tèst gùèssès òn thèìr òwn dèvìcè. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "When a secure link was created with a passphrase, the portal page shows a passphrase form before the thread, and the visitor enters the five word passphrase ..." |
*
* @param {Demo_Narrative_Client_Portal_Passphrase_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_portal_passphrase_body = /** @type {((inputs?: Demo_Narrative_Client_Portal_Passphrase_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Portal_Passphrase_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_portal_passphrase_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_client_portal_passphrase_body(inputs)
	return en_demo_narrative_client_portal_passphrase_body(inputs)
});