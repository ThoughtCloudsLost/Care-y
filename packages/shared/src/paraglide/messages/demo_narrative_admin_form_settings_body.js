/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Form_Settings_BodyInputs */

const en_demo_narrative_admin_form_settings_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Settings_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Each form carries an internal name, an address on the public site, a destination queue for the cases it creates, an optional closing date and a banner image. [[#admin-forms #portal]]
**What does the server store in the clear?** The name, the address, the destination queue, the default flag and the closing date are plaintext columns. The banner image is stored and served as plaintext because it is part of the form's public content. [Field list](#admin-forms/builder) covers how the rest of the form's content is protected. [[#server-holds #encryption]]
**Address uniqueness and the default flag.** Each form's address is unique within the organization, and saving a form with an address another form already holds is refused. One form at a time can carry the default flag, which selects the form served when no address is named. Setting a new default clears the previous one in the same write. [Intake forms list](#admin-org/intake-forms) covers what happens when no form is default and what activating a form does beyond saving. [[#portal #failure-states]]
**The closing date.** A form with a closing date stops accepting submissions once the date passes and shows the closing message instead. When the organization has not written a closing message, a built-in notice takes its place. Without a closing date, the form stays open until someone deactivates it. [Closed form](#client-intake/closed-form) covers what the visitor reaches. [[#portal]]
**The public link.** The link updates as the address is typed, so it can be copied before the form has been saved. It resolves to the form only after the form has been saved with that address and activated. Opening the link requires no account. [[#failure-states #portal]]
**The settings columns and the asset route.** Name, slug, default flag, destination queue and closing date are columns on \`intake_forms\` from \`packages/server/src/db/migrations/tenant/089_intake_forms.ts\` and \`097_intake_form_closes_at.ts\`. The banner is a row in \`form_assets\` from \`099_form_assets.ts\` keyed by a blob ID. \`packages/server/src/routes/form-assets.ts\` serves the image under \`/api/forms/\`, restricted to the form-asset prefix and to PNG, JPEG and WebP content types. [[#server-holds]]`)
};

const es_demo_narrative_admin_form_settings_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Settings_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cada formulario lleva un nombre interno, una dirección en el sitio público, una cola de destino para los casos que crea, una fecha de cierre opcional y una imagen de portada. [[#admin-forms #portal]]
**¿Qué guarda el servidor en texto plano?** El nombre, la dirección, la cola de destino, la marca de predeterminado y la fecha de cierre son columnas en texto plano. La imagen de portada se almacena y se sirve como texto plano porque forma parte del contenido público del formulario. [Lista de campos](#admin-forms/builder) trata cómo se protege el resto del contenido del formulario. [[#server-holds #encryption]]
**Unicidad de dirección y la marca de predeterminado.** La dirección de cada formulario es única dentro de la organización, y guardar un formulario con una dirección que otro ya ocupa se rechaza. Solo un formulario a la vez puede llevar la marca de predeterminado, que selecciona el formulario servido cuando no se nombra ninguna dirección. Marcar uno nuevo como predeterminado desmarca el anterior en la misma escritura. [Lista de formularios de admisión](#admin-org/intake-forms) trata qué ocurre cuando ningún formulario es predeterminado y qué hace la activación más allá del guardado. [[#portal #failure-states]]
**La fecha de cierre.** Un formulario con fecha de cierre deja de aceptar envíos cuando la fecha pasa y muestra el mensaje de cierre en su lugar. Cuando la organización no ha escrito un mensaje de cierre, un aviso integrado lo sustituye. Sin fecha de cierre, el formulario sigue abierto hasta que alguien lo desactiva. [Formulario cerrado](#client-intake/closed-form) trata a qué llega el visitante. [[#portal]]
**El enlace público.** El enlace se actualiza a medida que se escribe la dirección, de modo que se puede copiar antes de guardar el formulario. Solo lleva al formulario una vez guardado con esa dirección y activado. Abrirlo no requiere cuenta. [[#failure-states #portal]]
**Las columnas de configuración y la ruta de recursos.** El nombre, el slug, la marca de predeterminado, la cola de destino y la fecha de cierre son columnas de \`intake_forms\`, de \`packages/server/src/db/migrations/tenant/089_intake_forms.ts\` y \`097_intake_form_closes_at.ts\`. La imagen de portada es una fila de \`form_assets\`, de \`099_form_assets.ts\`, identificada por un blob ID. \`packages/server/src/routes/form-assets.ts\` sirve la imagen bajo \`/api/forms/\`, restringida al prefijo de recursos de formulario y a los tipos PNG, JPEG y WebP. [[#server-holds]]`)
};

const en_xa2_demo_narrative_admin_form_settings_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Settings_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èàch fòrm càrrìès àn ìntèrnàl nàmè, àn àddrèss òn thè pùblìc sìtè, à dèstìnàtìòn qùèùè fòr thè càsès ìt crèàtès, àn òptìònàl clòsìng dàtè ànd à bànnèr ìmàgè. [[#àdmìn-fòrms #pòrtàl]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè sèrvèr stòrè ìn thè clèàr? ••••••••••••** Thè nàmè, thè àddrèss, thè dèstìnàtìòn qùèùè, thè dèfàùlt flàg ànd thè clòsìng dàtè àrè plàìntèxt còlùmns. Thè bànnèr ìmàgè ìs stòrèd ànd sèrvèd às plàìntèxt bècàùsè ìt ìs pàrt òf thè fòrm's pùblìc còntènt. [Fìèld lìst](#àdmìn-fòrms/bùìldèr) còvèrs hòw thè rèst òf thè fòrm's còntènt ìs pròtèctèd. [[#sèrvèr-hòlds #èncryptìòn]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Àddrèss ùnìqùènèss ànd thè dèfàùlt flàg. ••••••••••••** Èàch fòrm's àddrèss ìs ùnìqùè wìthìn thè òrgànìzàtìòn, ànd sàvìng à fòrm wìth àn àddrèss ànòthèr fòrm àlrèàdy hòlds ìs rèfùsèd. Ònè fòrm àt à tìmè càn càrry thè dèfàùlt flàg, whìch sèlècts thè fòrm sèrvèd whèn nò àddrèss ìs nàmèd. Sèttìng à nèw dèfàùlt clèàrs thè prèvìòùs ònè ìn thè sàmè wrìtè. [Ìntàkè fòrms lìst](#àdmìn-òrg/ìntàkè-fòrms) còvèrs whàt hàppèns whèn nò fòrm ìs dèfàùlt ànd whàt àctìvàtìng à fòrm dòès bèyònd sàvìng. [[#pòrtàl #fàìlùrè-stàtès]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè clòsìng dàtè. ••••••** À fòrm wìth à clòsìng dàtè stòps àccèptìng sùbmìssìòns òncè thè dàtè pàssès ànd shòws thè clòsìng mèssàgè ìnstèàd. Whèn thè òrgànìzàtìòn hàs nòt wrìttèn à clòsìng mèssàgè, à bùìlt-ìn nòtìcè tàkès ìts plàcè. Wìthòùt à clòsìng dàtè, thè fòrm stàys òpèn ùntìl sòmèònè dèàctìvàtès ìt. [Clòsèd fòrm](#clìènt-ìntàkè/clòsèd-fòrm) còvèrs whàt thè vìsìtòr rèàchès. [[#pòrtàl]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè pùblìc lìnk. •••••** Thè lìnk ùpdàtès às thè àddrèss ìs typèd, sò ìt càn bè còpìèd bèfòrè thè fòrm hàs bèèn sàvèd. Ìt rèsòlvès tò thè fòrm ònly àftèr thè fòrm hàs bèèn sàvèd wìth thàt àddrèss ànd àctìvàtèd. Òpènìng thè lìnk rèqùìrès nò àccòùnt. [[#fàìlùrè-stàtès #pòrtàl]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè sèttìngs còlùmns ànd thè àssèt ròùtè. •••••••••••••** Nàmè, slùg, dèfàùlt flàg, dèstìnàtìòn qùèùè ànd clòsìng dàtè àrè còlùmns òn \`ìntàkè_fòrms\` fròm \`pàckàgès/sèrvèr/src/db/mìgràtìòns/tènànt/089_ìntàkè_fòrms.ts\` ànd \`097_ìntàkè_fòrm_clòsès_àt.ts\`. Thè bànnèr ìs à ròw ìn \`fòrm_àssèts\` fròm \`099_fòrm_àssèts.ts\` kèyèd by à blòb ÌD. \`pàckàgès/sèrvèr/src/ròùtès/fòrm-àssèts.ts\` sèrvès thè ìmàgè ùndèr \`/àpì/fòrms/\`, rèstrìctèd tò thè fòrm-àssèt prèfìx ànd tò PNG, JPÈG ànd WèbP còntènt typès. [[#sèrvèr-hòlds]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Each form carries an internal name, an address on the public site, a destination queue for the cases it creates, an optional closing date and a banner image...." |
*
* @param {Demo_Narrative_Admin_Form_Settings_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_form_settings_body = /** @type {((inputs?: Demo_Narrative_Admin_Form_Settings_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Form_Settings_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_form_settings_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_form_settings_body(inputs)
	return en_demo_narrative_admin_form_settings_body(inputs)
});