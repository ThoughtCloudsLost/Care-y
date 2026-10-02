/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Settings_Account_Panel_BodyInputs */

const en_demo_narrative_settings_account_panel_body = /** @type {(inputs: Demo_Narrative_Settings_Account_Panel_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The account panel opens from the identity button in the navbar below desktop width. It shows the user's display name, a role stamp, and the admin destinations the user has permission to see, grouped the same way the admin hub groups them. At desktop width, the sidebar provides these controls instead. [[#permissions]]
**Role stamp.** The stamp reads the user's role name. When the role's hub page admits the user, tapping the stamp opens it. When the hub page does not admit the user, the stamp is plain text. The [People](#admin/hub-people), [Communications](#admin/hub-comms), [Organization](#admin/hub-org) and [Analytics](#admin/hub-analytics) hub entries cover each destination and its requirements. [[#permissions]]
**What does a volunteer see?** A default volunteer holds none of the permissions that gate admin destinations. The panel shows the display name, the role stamp, Settings and Log out. [[#permissions]]
**Signing out.** Log out wipes the browser's key material and decrypt caches, then revokes the server session. If the server does not confirm revocation, the session lapses on its own within a day. [On the device](#deep-dive/on-the-device) covers what stays in the browser after the keys are gone. [[#keys #server-holds]]
**How is the display name protected?** The display name is sealed with the organization key. The server stores only the ciphertext. The panel decrypts it in the browser with the same organization key every display name surface uses. [How encryption works](#deep-dive/how-encryption-works) covers the organization key. [[#encryption #server-holds]]
**The panel, the sidebar and the destination list.** \`AvatarPanel.svelte\` in \`packages/client/src/lib/components/admin/\` renders inside a \`ShellPanel\` mounted by \`AppShell.svelte\` when the layout is not desktop. \`destinations.ts\` in \`packages/client/src/lib/admin/\` defines every destination, its permission gate and its group. The sidebar at desktop width reads the same destination list but renders its own controls for admin, settings and sign-out. [[#client-data]]`)
};

const es_demo_narrative_settings_account_panel_body = /** @type {(inputs: Demo_Narrative_Settings_Account_Panel_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El panel de cuenta se abre desde el botón de identidad en la barra de navegación por debajo del ancho de escritorio. Muestra el nombre visible de la persona usuaria, una insignia de rol y los destinos de administración para los que tiene permiso, agrupados del mismo modo que el centro de administración. A ancho de escritorio, la barra lateral proporciona estos controles. [[#permissions]]
**Insignia de rol.** La insignia muestra el nombre del rol. Cuando la página central del rol admite a la persona usuaria, tocar la insignia la abre. Cuando no la admite, la insignia es texto plano. Las entradas de [Personas](#admin/hub-people), [Comunicaciones](#admin/hub-comms), [Organización](#admin/hub-org) y [Analítica](#admin/hub-analytics) tratan cada destino y sus requisitos. [[#permissions]]
**¿Qué ve un voluntario?** Un voluntario con permisos predeterminados no tiene ninguno de los permisos que controlan los destinos de administración. El panel muestra el nombre visible, la insignia de rol, Ajustes y Cerrar sesión. [[#permissions]]
**Cierre de sesión.** Cerrar sesión borra las claves del navegador y las cachés de descifrado, y después revoca la sesión del servidor. Si el servidor no confirma la revocación, la sesión caduca por sí sola en un día. [En el dispositivo](#deep-dive/on-the-device) trata lo que permanece en el navegador una vez eliminadas las claves. [[#keys #server-holds]]
**¿Cómo se protege el nombre visible?** El nombre visible se sella con la clave de la organización. El servidor almacena solo el texto cifrado. El panel lo descifra en el navegador con la misma clave de organización que usa cada superficie de nombre visible. [Cómo funciona el cifrado](#deep-dive/how-encryption-works) trata la clave de la organización. [[#encryption #server-holds]]
**El panel, la barra lateral y la lista de destinos.** \`AvatarPanel.svelte\` en \`packages/client/src/lib/components/admin/\` se renderiza dentro de un \`ShellPanel\` montado por \`AppShell.svelte\` cuando la disposición no es de escritorio. \`destinations.ts\` en \`packages/client/src/lib/admin/\` define cada destino, su permiso de acceso y su grupo. La barra lateral a ancho de escritorio lee la misma lista de destinos pero renderiza sus propios controles de administración, ajustes y cierre de sesión. [[#client-data]]`)
};

const en_xa2_demo_narrative_settings_account_panel_body = /** @type {(inputs: Demo_Narrative_Settings_Account_Panel_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè àccòùnt pànèl òpèns fròm thè ìdèntìty bùttòn ìn thè nàvbàr bèlòw dèsktòp wìdth. Ìt shòws thè ùsèr's dìsplày nàmè, à ròlè stàmp, ànd thè àdmìn dèstìnàtìòns thè ùsèr hàs pèrmìssìòn tò sèè, gròùpèd thè sàmè wày thè àdmìn hùb gròùps thèm. Àt dèsktòp wìdth, thè sìdèbàr pròvìdès thèsè còntròls ìnstèàd. [[#pèrmìssìòns]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Ròlè stàmp. ••••** Thè stàmp rèàds thè ùsèr's ròlè nàmè. Whèn thè ròlè's hùb pàgè àdmìts thè ùsèr, tàppìng thè stàmp òpèns ìt. Whèn thè hùb pàgè dòès nòt àdmìt thè ùsèr, thè stàmp ìs plàìn tèxt. Thè [Pèòplè](#àdmìn/hùb-pèòplè), [Còmmùnìcàtìòns](#àdmìn/hùb-còmms), [Òrgànìzàtìòn](#àdmìn/hùb-òrg) ànd [Ànàlytìcs](#àdmìn/hùb-ànàlytìcs) hùb èntrìès còvèr èàch dèstìnàtìòn ànd ìts rèqùìrèmènts. [[#pèrmìssìòns]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès à vòlùntèèr sèè? ••••••••** À dèfàùlt vòlùntèèr hòlds nònè òf thè pèrmìssìòns thàt gàtè àdmìn dèstìnàtìòns. Thè pànèl shòws thè dìsplày nàmè, thè ròlè stàmp, Sèttìngs ànd Lòg òùt. [[#pèrmìssìòns]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••**Sìgnìng òùt. ••••** Lòg òùt wìpès thè bròwsèr's kèy màtèrìàl ànd dècrypt càchès, thèn rèvòkès thè sèrvèr sèssìòn. Ìf thè sèrvèr dòès nòt cònfìrm rèvòcàtìòn, thè sèssìòn làpsès òn ìts òwn wìthìn à dày. [Òn thè dèvìcè](#dèèp-dìvè/òn-thè-dèvìcè) còvèrs whàt stàys ìn thè bròwsèr àftèr thè kèys àrè gònè. [[#kèys #sèrvèr-hòlds]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Hòw ìs thè dìsplày nàmè pròtèctèd? •••••••••••** Thè dìsplày nàmè ìs sèàlèd wìth thè òrgànìzàtìòn kèy. Thè sèrvèr stòrès ònly thè cìphèrtèxt. Thè pànèl dècrypts ìt ìn thè bròwsèr wìth thè sàmè òrgànìzàtìòn kèy èvèry dìsplày nàmè sùrfàcè ùsès. [Hòw èncryptìòn wòrks](#dèèp-dìvè/hòw-èncryptìòn-wòrks) còvèrs thè òrgànìzàtìòn kèy. [[#èncryptìòn #sèrvèr-hòlds]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè pànèl, thè sìdèbàr ànd thè dèstìnàtìòn lìst. •••••••••••••••** \`ÀvàtàrPànèl.svèltè\` ìn \`pàckàgès/clìènt/src/lìb/còmpònènts/àdmìn/\` rèndèrs ìnsìdè à \`ShèllPànèl\` mòùntèd by \`ÀppShèll.svèltè\` whèn thè làyòùt ìs nòt dèsktòp. \`dèstìnàtìòns.ts\` ìn \`pàckàgès/clìènt/src/lìb/àdmìn/\` dèfìnès èvèry dèstìnàtìòn, ìts pèrmìssìòn gàtè ànd ìts gròùp. Thè sìdèbàr àt dèsktòp wìdth rèàds thè sàmè dèstìnàtìòn lìst bùt rèndèrs ìts òwn còntròls fòr àdmìn, sèttìngs ànd sìgn-òùt. [[#clìènt-dàtà]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The account panel opens from the identity button in the navbar below desktop width. It shows the user's display name, a role stamp, and the admin destination..." |
*
* @param {Demo_Narrative_Settings_Account_Panel_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_account_panel_body = /** @type {((inputs?: Demo_Narrative_Settings_Account_Panel_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Settings_Account_Panel_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_settings_account_panel_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_settings_account_panel_body(inputs)
	return en_demo_narrative_settings_account_panel_body(inputs)
});