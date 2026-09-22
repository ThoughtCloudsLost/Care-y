/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Branding_BodyInputs */

const en_demo_narrative_admin_branding_body = /** @type {(inputs: Demo_Narrative_Admin_Branding_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The organization's logo, its two brand colors and the welcome text a visitor reads are stored in the clear, so a page shown before anyone signs in can display them without holding a key. [[#server-holds #portal]]
**Why none of it is encrypted.** The organization's own subdomain arrives in the clear on every request and the server matches it against a plaintext slug, so the list of organizations on a server is available from a dump whatever these columns hold. The logo is served to anyone by an unauthenticated route, because the pages that show it are reached without an account. Encrypting the columns under a key derived from a public key stored in the same row protected neither fact, and it put decryption inside a web process that otherwise holds no key material at all. [The trust boundary](#deep-dive/the-trust-boundary) covers what else a dump yields. [[#encryption #server-holds]]
**What happens to a logo before it leaves the device.** Every accepted upload, PNG, JPEG or SVG, is drawn to a PNG in the browser, and that PNG is what is sent, so no markup or script travels inside an image. The redrawn file has to come in under 512 KB, and the server checks the magic bytes and its own 2 MB ceiling again before storing it. Separate app icons are generated after the save for the installed app and the home screen, and a failure in that step raises its own notice while the saved branding stands. [[#failure-states]]
**Colors that stay readable.** A brand color is stored as chosen, and the app derives a text color and a fill color from it, moving the lightness until each clears the WCAG AA contrast ratio of 4.5:1 against the worst surface it can land on, separately for light and dark mode. A color measuring close in OKLab to the shades the interface reserves for care and for urgency draws a notice with a nudged alternative, and saving the original is allowed. [[#failure-states]]
**Who can change the branding.** Editing branding requires the Manage organization identity permission, the same grant that covers [general information](#admin-org/general). [[#permissions]]
**The branding columns and the icon route.** The six columns are plaintext after \`packages/server/src/db/migrations/tenant/107_branding_plaintext.ts\`, which dropped the encrypted pair for each one and left \`encrypted_terminology\`, the org public key and the icon blob keys untouched. Reads and writes go through \`packages/server/src/branding/branding-service.ts\`, icons are served unauthenticated by \`packages/server/src/routes/branding-icons.ts\` with the blob key as the ETag, and the contrast and proximity math is \`packages/client/src/lib/branding/konsta-palette.ts\`. A logo URL that fails to load falls through to initials rather than a broken image. [[#server-holds #failure-states]]`)
};

const es_demo_narrative_admin_branding_body = /** @type {(inputs: Demo_Narrative_Admin_Branding_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El logotipo de la organización, sus dos colores de marca y el texto de bienvenida que lee un visitante se almacenan en claro, de modo que una página mostrada antes de que nadie inicie sesión puede presentarlos sin tener ninguna clave. [[#server-holds #portal]]
**Por qué nada de esto va cifrado.** El subdominio propio de la organización llega en claro en cada petición y el servidor lo compara con un identificador en texto plano, así que la lista de organizaciones de un servidor se obtiene de un volcado sea cual sea el contenido de estas columnas. El logotipo lo sirve a cualquiera una ruta sin autenticación, porque a las páginas que lo muestran se llega sin cuenta. Cifrar las columnas con una clave derivada de una clave pública guardada en esa misma fila no protegía ninguno de los dos hechos, y metía el descifrado en un proceso web que por lo demás no guarda ningún material de claves. [La frontera de confianza](#deep-dive/the-trust-boundary) trata lo demás que da un volcado. [[#encryption #server-holds]]
**Qué le pasa a un logotipo antes de salir del dispositivo.** Cada archivo aceptado, PNG, JPEG o SVG, se dibuja como PNG en el navegador, y ese PNG es lo que se envía, así que no viaja marcado ni código dentro de una imagen. El archivo redibujado tiene que quedar por debajo de 512 KB, y el servidor vuelve a comprobar los bytes iniciales y su propio tope de 2 MB antes de almacenarlo. Los iconos de la aplicación se generan aparte después del guardado, para la aplicación instalada y la pantalla de inicio, y un fallo en ese paso levanta su propio aviso mientras la marca guardada se mantiene. [[#failure-states]]
**Colores que siguen siendo legibles.** El color de marca se guarda tal como se elige, y la aplicación deriva de él un color de texto y un color de relleno, moviendo la luminosidad hasta que cada uno supera la relación de contraste WCAG AA de 4,5:1 frente a la peor superficie en la que puede aparecer, por separado en modo claro y en modo oscuro. Un color que mide cerca, en OKLab, de los tonos que la interfaz reserva para el cuidado y para la urgencia recibe un aviso con una alternativa desplazada, y se permite guardar el original. [[#failure-states]]
**Quién puede cambiar la marca.** Editar la marca requiere el permiso de gestionar la identidad de la organización, la misma concesión que cubre [la información general](#admin-org/general). [[#permissions]]
**Las columnas de marca y la ruta de iconos.** Las seis columnas quedaron en texto plano con \`packages/server/src/db/migrations/tenant/107_branding_plaintext.ts\`, que eliminó la columna cifrada de cada una y dejó intactos \`encrypted_terminology\`, la clave pública de la organización y las claves de los blobs de iconos. Las lecturas y escrituras pasan por \`packages/server/src/branding/branding-service.ts\`, los iconos los sirve sin autenticación \`packages/server/src/routes/branding-icons.ts\` usando la clave del blob como ETag, y el cálculo de contraste y de proximidad está en \`packages/client/src/lib/branding/konsta-palette.ts\`. Una URL de logotipo que no carga cae en las iniciales en lugar de en una imagen rota. [[#server-holds #failure-states]]`)
};

const en_xa2_demo_narrative_admin_branding_body = /** @type {(inputs: Demo_Narrative_Admin_Branding_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè òrgànìzàtìòn's lògò, twò brànd còlòrs, ànd thè tèxt shòwn tò thè vìsìtòr òn thè pòrtàl àrè stòrèd às plàìntèxt òn thè sèrvèr sò pàgès vìsìtèd bèfòrè sìgnìng ìn càn dìsplày thèm wìthòùt dècryptìòn.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt thè sèrvèr hòlds. •••••••** Whèn à lògò ìs ùplòàdèd, èvèry fìlè fòrmàt ìs ràstèrìzèd tò PNG ìn thè bròwsèr bèfòrè ìt lèàvès thè dèvìcè, ànd thè ràstèrìzèd rèsùlt ìs whàt thè sèrvèr rècèìvès. Àftèr sàvìng, sèpàràtè ìcòns àrè gènèràtèd fòr thè PWÀ mànìfèst ànd hòmè scrèèn, ànd à fàìlùrè ìn thàt stèp ràìsès ìts òwn nòtìcè wìthòùt ùndòìng thè bràndìng sàvè.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Còntràst. •••** Thè bràndìng èdìtòr chècks èàch brànd còlòr àgàìnst WCÀG ÀÀ còntràst rèqùìrèmènts ànd àdjùsts ìt àt rùntìmè whèn nèèdèd, ìn bòth lìght ànd dàrk mòdè. À còlòr thàt sìts tòò clòsè tò thè càrè òr ùrgènt sèmàntìc hùès dràws à nòtìcè òffèrìng à nùdgèd vàlùè, thòùgh sàvìng wìth thè òrìgìnàl ìs àlwàys àllòwèd.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Pèrmìssìòns. ••••** Èdìtìng bràndìng rèqùìrès thè Mànàgè òrgànìzàtìòn ìdèntìty pèrmìssìòn. ••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The organization's logo, its two brand colors and the welcome text a visitor reads are stored in the clear, so a page shown before anyone signs in can displa..." |
*
* @param {Demo_Narrative_Admin_Branding_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_branding_body = /** @type {((inputs?: Demo_Narrative_Admin_Branding_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Branding_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_branding_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_branding_body(inputs)
	return en_demo_narrative_admin_branding_body(inputs)
});