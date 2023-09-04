<?php

class ReadAloud {

	/**
	 * @param OutputPage &$out
	 * @param Skin &$skin
	 */
	public static function onBeforePageDisplay( OutputPage &$out, Skin &$skin ) {
		$out->addModules( 'ext.ReadAloud' );
		$out->addModuleStyles( 'ext.ReadAloud.styles' );
	}

	/**
	 * @param SkinTemplate $skinTemplate
	 * @param array &$links
	 */
	public static function onSkinTemplateNavigationUniversal( SkinTemplate $skinTemplate, array &$links ) {
		global $wgReadAloudNamespaces, $wgReadAloudNearEdit;

		// Only add the buttons in relevant pages
		$skin = $skinTemplate->getSkin();
		$title = $skin->getTitle();
		if ( ! $title->exists() ) {
			return;
		}
		$context = $skin->getContext();
		$action = Action::getActionName( $context );
		if ( $action !== 'view' ) {
			return;
		}
		$namespace = $title->getNamespace();
		if ( ! in_array( $namespace, $wgReadAloudNamespaces ) ) {
			return;
		}

		// Define the buttons
		$readAloud = [
			'id' => 'ca-read-aloud',
			'href' => '#',
			'text' => wfMessage( 'readaloud-read-aloud' )->plain()
		];
		$pauseReading = [
			'id' => 'ca-pause-reading',
			'href' => '#',
			'text' => wfMessage( 'readaloud-pause-reading' )->plain()
		];

		// Add the buttons
		$location = $wgReadAloudNearEdit ? 'views' : 'actions';
		$links[ $location ]['read-aloud'] = $readAloud;
		$links[ $location ]['pause-reading'] = $pauseReading;
	}
}
