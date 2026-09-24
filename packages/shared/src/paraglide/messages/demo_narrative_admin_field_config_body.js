/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Field_Config_BodyInputs */

const en_demo_narrative_admin_field_config_body = /** @type {(inputs: Demo_Narrative_Admin_Field_Config_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The field settings sheet controls the configuration for a single field, and its contents change with the field type. Every field has a label and optional help text for each locale and a required toggle. Text fields have a placeholder and maximum length, the two pick types have editable option lists, and the standalone checkbox has a toggle that requires the visitor to check it before submitting.
**Roles.** Ten roles tell the rest of the system what a field's answer means rather than leaving it an unlabeled string. Roles that identify a person, such as phone contact or real name, may appear at most once per form. The role and widget type are validated as a pair, and when a chosen role does not fit the current widget the sheet explains the conflict and offers the compatible widget as a correction.
**When it appears.** A field can be set to appear only when answers on earlier fields match specified values, expressed as groups of conditions.
**Persistence.** Changing the field type preserves the configuration of the type being left so switching back does not lose work, and clears only a role the new type cannot carry.`)
};

const es_demo_narrative_admin_field_config_body = /** @type {(inputs: Demo_Narrative_Admin_Field_Config_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La hoja de configuración de campo controla los ajustes de un campo individual, y su contenido cambia según el tipo de campo. Todos los campos tienen una etiqueta y un texto de ayuda opcional para cada idioma y una alternancia de obligatorio. Los campos de texto tienen marcador de posición y longitud máxima, los dos tipos de selección tienen listas de opciones editables, y la casilla de verificación individual tiene una alternancia que exige que el visitante la marque antes de enviar.
**Roles.** Diez roles le indican al resto del sistema qué significa la respuesta de un campo en lugar de dejarla como una cadena sin clasificar. Los roles que identifican a una persona, como teléfono de contacto o nombre real, pueden aparecer como máximo una vez por formulario. El rol y el tipo de control se validan como par, y cuando un rol elegido no es compatible con el control actual la hoja explica el conflicto y ofrece el control compatible como corrección.
**Cuándo aparece.** Un campo se puede configurar para que aparezca solo cuando las respuestas en campos anteriores coincidan con valores especificados, expresados como grupos de condiciones.
**Persistencia.** Cambiar el tipo de campo conserva la configuración del tipo que se deja para que volver no pierda trabajo, y solo borra un rol que el nuevo tipo no puede llevar.`)
};

const en_xa2_demo_narrative_admin_field_config_body = /** @type {(inputs: Demo_Narrative_Admin_Field_Config_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè fìèld sèttìngs shèèt còntròls thè cònfìgùràtìòn fòr à sìnglè fìèld, ànd ìts còntènts chàngè wìth thè fìèld typè. Èvèry fìèld hàs à làbèl ànd òptìònàl hèlp tèxt fòr èàch lòcàlè ànd à rèqùìrèd tògglè. Tèxt fìèlds hàvè à plàcèhòldèr ànd màxìmùm lèngth, thè twò pìck typès hàvè èdìtàblè òptìòn lìsts, ànd thè stàndàlònè chèckbòx hàs à tògglè thàt rèqùìrès thè vìsìtòr tò chèck ìt bèfòrè sùbmìttìng.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Ròlès. ••** Tèn ròlès tèll thè rèst òf thè systèm whàt à fìèld's ànswèr mèàns ràthèr thàn lèàvìng ìt àn ùnlàbèlèd strìng. Ròlès thàt ìdèntìfy à pèrsòn, sùch às phònè còntàct òr rèàl nàmè, mày àppèàr àt mòst òncè pèr fòrm. Thè ròlè ànd wìdgèt typè àrè vàlìdàtèd às à pàìr, ànd whèn à chòsèn ròlè dòès nòt fìt thè cùrrènt wìdgèt thè shèèt èxplàìns thè cònflìct ànd òffèrs thè còmpàtìblè wìdgèt às à còrrèctìòn.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whèn ìt àppèàrs. •••••** À fìèld càn bè sèt tò àppèàr ònly whèn ànswèrs òn èàrlìèr fìèlds màtch spècìfìèd vàlùès, èxprèssèd às gròùps òf còndìtìòns.
 ••••••••••••••••••••••••••••••••••••••**Pèrsìstèncè. ••••** Chàngìng thè fìèld typè prèsèrvès thè cònfìgùràtìòn òf thè typè bèìng lèft sò swìtchìng bàck dòès nòt lòsè wòrk, ànd clèàrs ònly à ròlè thè nèw typè cànnòt càrry. •••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The field settings sheet controls the configuration for a single field, and its contents change with the field type. Every field has a label and optional hel..." |
*
* @param {Demo_Narrative_Admin_Field_Config_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_field_config_body = /** @type {((inputs?: Demo_Narrative_Admin_Field_Config_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Field_Config_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_field_config_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_field_config_body(inputs)
	return en_demo_narrative_admin_field_config_body(inputs)
});