/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Intake_Fields_BodyInputs */

const en_demo_narrative_client_intake_fields_body = /** @type {(inputs: Demo_Narrative_Client_Intake_Fields_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`When the organization has published a custom intake form, the intake page shows its configured fields instead of the built-in default.
**Conditional fields.** The server never receives an answer the visitor did not see, because a field with a visibility condition stays hidden until the controlling field has the required value, and hidden fields are excluded from both the encrypted response and the ticket text.
**Paging.** When the form has page breaks the next button validates the current page's visible fields before advancing, and the submit button appears only on the final page.
**Encryption.** Only someone who holds the organization's private key can read a submitted answer, because the intake form generates a fresh symmetric content key for each submission, encrypts every field value with that key, and seals the content key to the organization's public key. Field labels and help text are encrypted under a key any visitor's browser can derive from publicly available information, which protects them in a database dump but not against a live server.
**Privacy indicator.** Fields that carry a semantic role show a per-field indicator on the intake form. A field whose role is browser-only shows that the answer is encrypted and the server cannot read it, and a field that carries a routing role shows that the answer is encrypted but the visitor's selection shares a derived signal with the server, because the browser resolves the selected option to a queue, priority, or escalation value and sends that derived signal in the clear while the answer text stays encrypted. Fields with no semantic role show no indicator at all.`)
};

const es_demo_narrative_client_intake_fields_body = /** @type {(inputs: Demo_Narrative_Client_Intake_Fields_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuando la organización ha publicado un formulario de admisión personalizado, la página de admisión muestra sus campos configurados en lugar del predeterminado integrado.
**Campos condicionales.** El servidor nunca recibe una respuesta que el visitante no vio, porque un campo con una condición de visibilidad permanece oculto hasta que el campo controlador tiene el valor requerido, y los campos ocultos se excluyen tanto de la respuesta cifrada como del texto del ticket.
**Paginación.** Cuando el formulario tiene saltos de página el botón de avanzar valida los campos visibles de la página actual antes de continuar, y el botón de enviar aparece solo en la página final.
**Cifrado.** Solo quien posea la clave privada de la organización puede leer una respuesta enviada, porque el formulario de admisión genera una clave simétrica de contenido nueva para cada envío, cifra cada valor de campo con esa clave y sella la clave de contenido con la clave pública de la organización. Las etiquetas de campo y el texto de ayuda están cifrados bajo una clave que cualquier navegador visitante puede derivar a partir de información pública, lo cual los protege en un volcado de base de datos pero no contra un servidor en funcionamiento.
**Indicador de privacidad.** Los campos que llevan un rol semántico muestran un indicador por campo en el formulario de admisión. Un campo cuyo rol es exclusivo del navegador muestra que la respuesta está cifrada y el servidor no puede leerla, y un campo que lleva un rol de enrutamiento muestra que la respuesta está cifrada pero la selección del visitante comparte una señal derivada con el servidor, porque el navegador resuelve la opción seleccionada a un valor de cola, prioridad o escalamiento y envía esa señal derivada en claro mientras el texto de la respuesta permanece cifrado. Los campos sin rol semántico no muestran ningún indicador.`)
};

const en_xa2_demo_narrative_client_intake_fields_body = /** @type {(inputs: Demo_Narrative_Client_Intake_Fields_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Whèn thè òrgànìzàtìòn hàs pùblìshèd à cùstòm ìntàkè fòrm, thè ìntàkè pàgè shòws ìts cònfìgùrèd fìèlds ìnstèàd òf thè bùìlt-ìn dèfàùlt.
 •••••••••••••••••••••••••••••••••••••••••**Còndìtìònàl fìèlds. ••••••** Thè sèrvèr nèvèr rècèìvès àn ànswèr thè vìsìtòr dìd nòt sèè, bècàùsè à fìèld wìth à vìsìbìlìty còndìtìòn stàys hìddèn ùntìl thè còntròllìng fìèld hàs thè rèqùìrèd vàlùè, ànd hìddèn fìèlds àrè èxclùdèd fròm bòth thè èncryptèd rèspònsè ànd thè tìckèt tèxt.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Pàgìng. •••** Whèn thè fòrm hàs pàgè brèàks thè nèxt bùttòn vàlìdàtès thè cùrrènt pàgè's vìsìblè fìèlds bèfòrè àdvàncìng, ànd thè sùbmìt bùttòn àppèàrs ònly òn thè fìnàl pàgè.
 •••••••••••••••••••••••••••••••••••••••••••••••••**Èncryptìòn. ••••** Ònly sòmèònè whò hòlds thè òrgànìzàtìòn's prìvàtè kèy càn rèàd à sùbmìttèd ànswèr, bècàùsè thè ìntàkè fòrm gènèràtès à frèsh symmètrìc còntènt kèy fòr èàch sùbmìssìòn, èncrypts èvèry fìèld vàlùè wìth thàt kèy, ànd sèàls thè còntènt kèy tò thè òrgànìzàtìòn's pùblìc kèy. Fìèld làbèls ànd hèlp tèxt àrè èncryptèd ùndèr à kèy àny vìsìtòr's bròwsèr càn dèrìvè fròm pùblìcly àvàìlàblè ìnfòrmàtìòn, whìch pròtècts thèm ìn à dàtàbàsè dùmp bùt nòt àgàìnst à lìvè sèrvèr.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Prìvàcy ìndìcàtòr. ••••••** Fìèlds thàt càrry à sèmàntìc ròlè shòw à pèr-fìèld ìndìcàtòr òn thè ìntàkè fòrm. À fìèld whòsè ròlè ìs bròwsèr-ònly shòws thàt thè ànswèr ìs èncryptèd ànd thè sèrvèr cànnòt rèàd ìt, ànd à fìèld thàt càrrìès à ròùtìng ròlè shòws thàt thè ànswèr ìs èncryptèd bùt thè vìsìtòr's sèlèctìòn shàrès à dèrìvèd sìgnàl wìth thè sèrvèr, bècàùsè thè bròwsèr rèsòlvès thè sèlèctèd òptìòn tò à qùèùè, prìòrìty, òr èscàlàtìòn vàlùè ànd sènds thàt dèrìvèd sìgnàl ìn thè clèàr whìlè thè ànswèr tèxt stàys èncryptèd. Fìèlds wìth nò sèmàntìc ròlè shòw nò ìndìcàtòr àt àll. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "When the organization has published a custom intake form, the intake page shows its configured fields instead of the built-in default. **Conditional fields.*..." |
*
* @param {Demo_Narrative_Client_Intake_Fields_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_intake_fields_body = /** @type {((inputs?: Demo_Narrative_Client_Intake_Fields_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Intake_Fields_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_intake_fields_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_client_intake_fields_body(inputs)
	return en_demo_narrative_client_intake_fields_body(inputs)
});