/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Hub_Org_BodyInputs */

const en_demo_narrative_admin_hub_org_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_Org_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The organization group collects the settings that apply to the whole workspace, not to any single ticket, from naming and branding to retention and key custody. [[#permissions]]
**What stays readable without a key?** The organization's name, logo, colors and support label are plaintext columns. Both the sign-in page and every client-facing page need those values before any user holds a key, so encrypting them would leave the pages blank. Terminology and note type names are sealed to the organization key. Note type escalation targets are encrypted under the server's operational key because the server sends those notifications itself. [General info](#admin-org/general) covers the four plaintext columns in detail. [[#encryption #server-holds]]
**Which permission gates each destination?** General, Branding and Terminology share the Manage org identity permission. Retention, Follow-Up Types, Intake Forms, Funds and Keys each carry a separate permission. Funds requires the Manage funds permission and Keys requires the Manage keys permission, and the Manage keys permission is one of three locked to the administrator role. Delete Organization requires the Request org deletion permission. Intake Forms is the one destination in this group that a default manager account holds, through the Manage intake forms permission. [Permission matrix](#admin-people/role-permissions) covers which grants an organization can reassign. [[#permissions #keys]]`)
};

const es_demo_narrative_admin_hub_org_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_Org_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El grupo de organización reúne los ajustes que se aplican al espacio de trabajo completo, no a un ticket concreto, desde el nombre y la marca hasta la retención y la custodia de claves. [[#permissions]]
**¿Qué se puede leer sin una clave?** El nombre de la organización, el logotipo, los colores y la etiqueta de apoyo son columnas en texto plano. Tanto la página de inicio de sesión como las páginas dirigidas al cliente necesitan esos valores antes de que nadie tenga una clave, por lo que cifrarlos dejaría las páginas en blanco. La terminología y los nombres de los tipos de nota se sellan con la clave de la organización. Los destinos de escalación de los tipos de nota se cifran con la clave operativa del servidor porque el servidor envía esas notificaciones por sí mismo. [Información general](#admin-org/general) trata las cuatro columnas en texto plano en detalle. [[#encryption #server-holds]]
**¿Qué permiso controla cada destino?** General, Marca y Terminología comparten el permiso Gestionar identidad de la organización. Retención, Tipos de seguimiento, Formularios de admisión, Fondos y Claves llevan cada uno un permiso separado. Fondos requiere el permiso Gestionar fondos y Claves requiere el permiso Gestionar claves, y el permiso Gestionar claves es uno de tres bloqueados al rol de administración. Eliminar organización requiere el permiso Solicitar eliminación de la organización. Formularios de admisión es el único destino de este grupo que una cuenta de gestión predeterminada posee, a través del permiso Gestionar formularios de ingreso. [Matriz de permisos](#admin-people/role-permissions) trata qué permisos puede reasignar una organización. [[#permissions #keys]]`)
};

const en_xa2_demo_narrative_admin_hub_org_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_Org_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè òrgànìzàtìòn gròùp còllècts thè sèttìngs thàt àpply tò thè whòlè wòrkspàcè, nòt tò àny sìnglè tìckèt, fròm nàmìng ànd bràndìng tò rètèntìòn ànd kèy cùstòdy. [[#pèrmìssìòns]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt stàys rèàdàblè wìthòùt à kèy? •••••••••••** Thè òrgànìzàtìòn's nàmè, lògò, còlòrs ànd sùppòrt làbèl àrè plàìntèxt còlùmns. Bòth thè sìgn-ìn pàgè ànd èvèry clìènt-fàcìng pàgè nèèd thòsè vàlùès bèfòrè àny ùsèr hòlds à kèy, sò èncryptìng thèm wòùld lèàvè thè pàgès blànk. Tèrmìnòlògy ànd nòtè typè nàmès àrè sèàlèd tò thè òrgànìzàtìòn kèy. Nòtè typè èscàlàtìòn tàrgèts àrè èncryptèd ùndèr thè sèrvèr's òpèràtìònàl kèy bècàùsè thè sèrvèr sènds thòsè nòtìfìcàtìòns ìtsèlf. [Gènèràl ìnfò](#àdmìn-òrg/gènèràl) còvèrs thè fòùr plàìntèxt còlùmns ìn dètàìl. [[#èncryptìòn #sèrvèr-hòlds]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whìch pèrmìssìòn gàtès èàch dèstìnàtìòn? ••••••••••••** Gènèràl, Bràndìng ànd Tèrmìnòlògy shàrè thè Mànàgè òrg ìdèntìty pèrmìssìòn. Rètèntìòn, Fòllòw-Ùp Typès, Ìntàkè Fòrms, Fùnds ànd Kèys èàch càrry à sèpàràtè pèrmìssìòn. Fùnds rèqùìrès thè Mànàgè fùnds pèrmìssìòn ànd Kèys rèqùìrès thè Mànàgè kèys pèrmìssìòn, ànd thè Mànàgè kèys pèrmìssìòn ìs ònè òf thrèè lòckèd tò thè àdmìnìstràtòr ròlè. Dèlètè Òrgànìzàtìòn rèqùìrès thè Rèqùèst òrg dèlètìòn pèrmìssìòn. Ìntàkè Fòrms ìs thè ònè dèstìnàtìòn ìn thìs gròùp thàt à dèfàùlt mànàgèr àccòùnt hòlds, thròùgh thè Mànàgè ìntàkè fòrms pèrmìssìòn. [Pèrmìssìòn màtrìx](#àdmìn-pèòplè/ròlè-pèrmìssìòns) còvèrs whìch grànts àn òrgànìzàtìòn càn rèàssìgn. [[#pèrmìssìòns #kèys]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The organization group collects the settings that apply to the whole workspace, not to any single ticket, from naming and branding to retention and key custo..." |
*
* @param {Demo_Narrative_Admin_Hub_Org_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_hub_org_body = /** @type {((inputs?: Demo_Narrative_Admin_Hub_Org_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Hub_Org_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_hub_org_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_hub_org_body(inputs)
	return en_demo_narrative_admin_hub_org_body(inputs)
});