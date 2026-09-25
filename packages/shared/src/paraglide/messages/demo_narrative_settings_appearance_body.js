/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Settings_Appearance_BodyInputs */

const en_demo_narrative_settings_appearance_body = /** @type {(inputs: Demo_Narrative_Settings_Appearance_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The color scheme alternates between light and dark, and the choice is written to the browser's own storage on that device and sent nowhere. A browser with nothing recorded starts dark. [[#client-data #privacy]]
**What the preference can hold.** Beyond the two fixed values it can hold a third that takes the scheme from the device's own setting and re-resolves whenever that setting changes, which is how a system-wide switch to dark reaches the app without being told again. What is stored is the preference rather than the scheme it resolved to, so a device that follows its own setting keeps following it. [[#client-data]]
**The one appearance choice that is not on the device.** The interface language is stored on the account rather than in the browser, sealed to the organization's public key, so it follows the account to another device while a color scheme stays on the browser that set it. [Language selection](#settings/language) covers what the server holds of that choice. [[#encryption #server-holds]]
**What is not asked.** The iOS or Material styling is taken from the browser's user agent at first load and kept on the device under its own key, with no request to the server and no setting to change it. Organization branding arrives separately, so the colors an organization sets and the scheme a device prefers are resolved together at each switch. [[#client-data]]
**The store and its keys.** The scheme, the platform styling and the dev-only visual themes are all in \`packages/client/src/lib/stores/theme.svelte.ts\`, under \`care-y-color-scheme\` and \`care-y-theme\` in local storage, and the settings row runs \`toggleSchemeWithPalette\` in \`packages/client/src/lib/branding/scheme-toggle.ts\`, which re-derives the palette from the organization's colors after the scheme lands. [[#client-data]]`)
};

const es_demo_narrative_settings_appearance_body = /** @type {(inputs: Demo_Narrative_Settings_Appearance_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El esquema de color alterna entre claro y oscuro, y la elección se escribe en el almacenamiento del propio navegador de ese dispositivo y no se envía a ninguna parte. Un navegador sin nada registrado arranca en oscuro. [[#client-data #privacy]]
**Qué puede contener la preferencia.** Además de los dos valores fijos admite un tercero que toma el esquema del ajuste del propio dispositivo y lo vuelve a resolver cada vez que ese ajuste cambia, que es como un cambio a oscuro en todo el sistema llega a la aplicación sin volver a indicárselo. Lo que se guarda es la preferencia y no el esquema al que se resolvió, de modo que un dispositivo que sigue su propio ajuste lo mantiene así. [[#client-data]]
**La única elección de apariencia que no vive en el dispositivo.** El idioma de la interfaz se guarda en la cuenta y no en el navegador, sellado con la clave pública de la organización, así que acompaña a la cuenta a otro dispositivo mientras que un esquema de color se queda en el navegador que lo fijó. [Selección de idioma](#settings/language) trata lo que el servidor guarda de esa elección. [[#encryption #server-holds]]
**Lo que no se pregunta.** El estilo iOS o Material se toma del agente de usuario del navegador en la primera carga y se conserva en el dispositivo bajo su propia clave, sin ninguna petición al servidor y sin ningún ajuste que lo cambie. La identidad visual de la organización llega por separado, de modo que los colores que fija una organización y el esquema que prefiere un dispositivo se resuelven juntos en cada cambio. [[#client-data]]
**El almacén y sus claves.** El esquema, el estilo de plataforma y los temas visuales de desarrollo están en \`packages/client/src/lib/stores/theme.svelte.ts\`, bajo \`care-y-color-scheme\` y \`care-y-theme\` en el almacenamiento local, y la fila de ajustes ejecuta \`toggleSchemeWithPalette\`, en \`packages/client/src/lib/branding/scheme-toggle.ts\`, que vuelve a derivar la paleta a partir de los colores de la organización una vez aplicado el esquema. [[#client-data]]`)
};

const en_xa2_demo_narrative_settings_appearance_body = /** @type {(inputs: Demo_Narrative_Settings_Appearance_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè còlòr schèmè àltèrnàtès bètwèèn lìght ànd dàrk, ànd thè chòìcè ìs wrìttèn tò thè bròwsèr's òwn stòràgè òn thàt dèvìcè ànd sènt nòwhèrè. À bròwsèr wìth nòthìng rècòrdèd stàrts dàrk. [[#clìènt-dàtà #prìvàcy]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt thè prèfèrèncè càn hòld. •••••••••** Bèyònd thè twò fìxèd vàlùès ìt càn hòld à thìrd thàt tàkès thè schèmè fròm thè dèvìcè's òwn sèttìng ànd rè-rèsòlvès whènèvèr thàt sèttìng chàngès, whìch ìs hòw à systèm-wìdè swìtch tò dàrk rèàchès thè àpp wìthòùt bèìng tòld àgàìn. Whàt ìs stòrèd ìs thè prèfèrèncè ràthèr thàn thè schèmè ìt rèsòlvèd tò, sò à dèvìcè thàt fòllòws ìts òwn sèttìng kèèps fòllòwìng ìt. [[#clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè ònè àppèàràncè chòìcè thàt ìs nòt òn thè dèvìcè. ••••••••••••••••** Thè ìntèrfàcè làngùàgè ìs stòrèd òn thè àccòùnt ràthèr thàn ìn thè bròwsèr, sèàlèd tò thè òrgànìzàtìòn's pùblìc kèy, sò ìt fòllòws thè àccòùnt tò ànòthèr dèvìcè whìlè à còlòr schèmè stàys òn thè bròwsèr thàt sèt ìt. [Làngùàgè sèlèctìòn](#sèttìngs/làngùàgè) còvèrs whàt thè sèrvèr hòlds òf thàt chòìcè. [[#èncryptìòn #sèrvèr-hòlds]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt ìs nòt àskèd. ••••••** Thè ìÒS òr Màtèrìàl stylìng ìs tàkèn fròm thè bròwsèr's ùsèr àgènt àt fìrst lòàd ànd kèpt òn thè dèvìcè ùndèr ìts òwn kèy, wìth nò rèqùèst tò thè sèrvèr ànd nò sèttìng tò chàngè ìt. Òrgànìzàtìòn bràndìng àrrìvès sèpàràtèly, sò thè còlòrs àn òrgànìzàtìòn sèts ànd thè schèmè à dèvìcè prèfèrs àrè rèsòlvèd tògèthèr àt èàch swìtch. [[#clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè stòrè ànd ìts kèys. •••••••** Thè schèmè, thè plàtfòrm stylìng ànd thè dèv-ònly vìsùàl thèmès àrè àll ìn \`pàckàgès/clìènt/src/lìb/stòrès/thèmè.svèltè.ts\`, ùndèr \`càrè-y-còlòr-schèmè\` ànd \`càrè-y-thèmè\` ìn lòcàl stòràgè, ànd thè sèttìngs ròw rùns \`tògglèSchèmèWìthPàlèttè\` ìn \`pàckàgès/clìènt/src/lìb/bràndìng/schèmè-tògglè.ts\`, whìch rè-dèrìvès thè pàlèttè fròm thè òrgànìzàtìòn's còlòrs àftèr thè schèmè lànds. [[#clìènt-dàtà]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The color scheme alternates between light and dark, and the choice is written to the browser's own storage on that device and sent nowhere. A browser with no..." |
*
* @param {Demo_Narrative_Settings_Appearance_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_appearance_body = /** @type {((inputs?: Demo_Narrative_Settings_Appearance_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Settings_Appearance_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_settings_appearance_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_settings_appearance_body(inputs)
	return en_demo_narrative_settings_appearance_body(inputs)
});