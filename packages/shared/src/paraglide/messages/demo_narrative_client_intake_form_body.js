/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Intake_Form_BodyInputs */

const en_demo_narrative_client_intake_form_body = /** @type {(inputs: Demo_Narrative_Client_Intake_Form_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The intake form is the first thing a person seeking help sees, and no login or account is needed to use it.
**Quick exit.** The quick exit control is rendered once by the client shell rather than by each page, so it is present on every client page and a new page cannot forget it. The full sequence and its safety net are documented in the quick exit entry.
**Default form.** Every organization has a built-in intake form with a name field and a contact method selector. Administrators can publish custom forms that replace it with their own fields, and each custom form gets its own shareable link.
**Org-authored content.** The intake form can carry a custom introduction written by an administrator in the form builder, a banner image, and a custom submission message that replaces the default confirmation copy. The introduction and the submission message are encrypted at rest and decrypted by the visitor's browser for display, while the banner image is decrypted by the server on the fly and served as an ordinary image.
**Device traces.** The intake form itself writes nothing to local storage, session storage, or cookies, and anything the visitor typed stays in memory only until the tab closes. The language picker and the colour-scheme toggle in the drawer do write persistent state: the language picker sets a cookie and the colour-scheme toggle writes to local storage, so a visitor who uses either one leaves a trace the form alone would not. A browser history entry also remains because the page is a normal navigation.
**If it fails.** The intake form shows an error with a retry option when a network or decryption failure prevents loading, and if the organization's public key is not available at all it tells the visitor it cannot encrypt and suggests calling instead.
**When it is empty.** The intake page shows a notice that the form is not available when intake is disabled at the organization level, when the form address does not match a published form, or when the built-in default form has been turned off, and when JavaScript is disabled a separate notice explains that the form needs it to encrypt.`)
};

const es_demo_narrative_client_intake_form_body = /** @type {(inputs: Demo_Narrative_Client_Intake_Form_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El formulario de admisión es lo primero que ve una persona que busca ayuda, y no se necesita inicio de sesión ni cuenta para usarlo.
**Salida rápida.** El control de salida rápida se muestra una sola vez desde la estructura del cliente en lugar de desde cada página, por lo que está presente en todas las páginas del cliente y una página nueva no puede omitirlo. La secuencia completa y su respaldo se documentan en la entrada de salida rápida.
**Formulario predeterminado.** Toda organización tiene un formulario de admisión integrado con un campo de nombre y un selector de método de contacto. Los administradores pueden publicar formularios personalizados que lo reemplacen con sus propios campos, y cada formulario personalizado obtiene su propio enlace compartible.
**Contenido de la organización.** El formulario de admisión puede llevar una introducción personalizada escrita por un administrador en el constructor de formularios, una imagen de portada y un mensaje de envío personalizado que reemplaza la confirmación predeterminada. La introducción y el mensaje de envío están cifrados en reposo y el navegador del visitante los descifra para mostrarlos, mientras que la imagen de portada es descifrada por el servidor en el momento y servida como una imagen normal.
**Rastros en el dispositivo.** El formulario de admisión no escribe nada en almacenamiento local, almacenamiento de sesión ni cookies, y lo que el visitante haya escrito queda solo en memoria hasta que se cierre la pestaña. El selector de idioma y el selector de esquema de color del cajón lateral sí escriben estado persistente: el selector de idioma establece una cookie y el selector de esquema de color escribe en almacenamiento local, por lo que un visitante que use cualquiera de los dos deja un rastro que el formulario por sí solo no dejaría. Una entrada en el historial del navegador también permanece porque la página es una navegación normal.
**Si falla.** El formulario de admisión muestra un aviso con la opción de reintentar cuando un error de red o de descifrado impide la carga, y si la clave pública de la organización no está disponible en absoluto, le indica al visitante que no puede cifrar y sugiere llamar en su lugar.
**Cuando está vacío.** La página de admisión muestra un aviso de que el formulario no está disponible cuando la admisión está desactivada a nivel de la organización, cuando la dirección del formulario no coincide con un formulario publicado o cuando el formulario predeterminado integrado ha sido desactivado, y cuando JavaScript está desactivado un aviso separado explica que el formulario lo necesita para cifrar la información.`)
};

const en_xa2_demo_narrative_client_intake_form_body = /** @type {(inputs: Demo_Narrative_Client_Intake_Form_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè ìntàkè fòrm ìs thè fìrst thìng à pèrsòn sèèkìng hèlp sèès, ànd nò lògìn òr àccòùnt ìs nèèdèd tò ùsè ìt.
 •••••••••••••••••••••••••••••••••**Qùìck èxìt. ••••** Thè qùìck èxìt còntròl ìs rèndèrèd òncè by thè clìènt shèll ràthèr thàn by èàch pàgè, sò ìt ìs prèsènt òn èvèry clìènt pàgè ànd à nèw pàgè cànnòt fòrgèt ìt. Thè fùll sèqùèncè ànd ìts sàfèty nèt àrè dòcùmèntèd ìn thè qùìck èxìt èntry.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Dèfàùlt fòrm. ••••** Èvèry òrgànìzàtìòn hàs à bùìlt-ìn ìntàkè fòrm wìth à nàmè fìèld ànd à còntàct mèthòd sèlèctòr. Àdmìnìstràtòrs càn pùblìsh cùstòm fòrms thàt rèplàcè ìt wìth thèìr òwn fìèlds, ànd èàch cùstòm fòrm gèts ìts òwn shàrèàblè lìnk.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Òrg-àùthòrèd còntènt. •••••••** Thè ìntàkè fòrm càn càrry à cùstòm ìntròdùctìòn wrìttèn by àn àdmìnìstràtòr ìn thè fòrm bùìldèr, à bànnèr ìmàgè, ànd à cùstòm sùbmìssìòn mèssàgè thàt rèplàcès thè dèfàùlt cònfìrmàtìòn còpy. Thè ìntròdùctìòn ànd thè sùbmìssìòn mèssàgè àrè èncryptèd àt rèst ànd dècryptèd by thè vìsìtòr's bròwsèr fòr dìsplày, whìlè thè bànnèr ìmàgè ìs dècryptèd by thè sèrvèr òn thè fly ànd sèrvèd às àn òrdìnàry ìmàgè.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Dèvìcè tràcès. •••••** Thè ìntàkè fòrm ìtsèlf wrìtès nòthìng tò lòcàl stòràgè, sèssìòn stòràgè, òr còòkìès, ànd ànythìng thè vìsìtòr typèd stàys ìn mèmòry ònly ùntìl thè tàb clòsès. Thè làngùàgè pìckèr ànd thè còlòùr-schèmè tògglè ìn thè dràwèr dò wrìtè pèrsìstènt stàtè: thè làngùàgè pìckèr sèts à còòkìè ànd thè còlòùr-schèmè tògglè wrìtès tò lòcàl stòràgè, sò à vìsìtòr whò ùsès èìthèr ònè lèàvès à tràcè thè fòrm àlònè wòùld nòt. À bròwsèr hìstòry èntry àlsò rèmàìns bècàùsè thè pàgè ìs à nòrmàl nàvìgàtìòn.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Ìf ìt fàìls. ••••** Thè ìntàkè fòrm shòws àn èrròr wìth à rètry òptìòn whèn à nètwòrk òr dècryptìòn fàìlùrè prèvènts lòàdìng, ànd ìf thè òrgànìzàtìòn's pùblìc kèy ìs nòt àvàìlàblè àt àll ìt tèlls thè vìsìtòr ìt cànnòt èncrypt ànd sùggèsts càllìng ìnstèàd.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whèn ìt ìs èmpty. ••••••** Thè ìntàkè pàgè shòws à nòtìcè thàt thè fòrm ìs nòt àvàìlàblè whèn ìntàkè ìs dìsàblèd àt thè òrgànìzàtìòn lèvèl, whèn thè fòrm àddrèss dòès nòt màtch à pùblìshèd fòrm, òr whèn thè bùìlt-ìn dèfàùlt fòrm hàs bèèn tùrnèd òff, ànd whèn JàvàScrìpt ìs dìsàblèd à sèpàràtè nòtìcè èxplàìns thàt thè fòrm nèèds ìt tò èncrypt. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The intake form is the first thing a person seeking help sees, and no login or account is needed to use it. **Quick exit.** The quick exit control is rendere..." |
*
* @param {Demo_Narrative_Client_Intake_Form_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_intake_form_body = /** @type {((inputs?: Demo_Narrative_Client_Intake_Form_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Intake_Form_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_intake_form_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_client_intake_form_body(inputs)
	return en_demo_narrative_client_intake_form_body(inputs)
});