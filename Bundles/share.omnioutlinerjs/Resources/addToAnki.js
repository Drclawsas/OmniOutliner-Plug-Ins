// This action requires using the 'Add to Anki' otemplate and appropriate configuration for card types in Anki. Three custom card types are defined with custom fields: {Basic: Front, Back, Reference, Reverse, Extra}, {Cloze: Text, Reference, Extra}, {Input: Front, Back, Reference, Extra}.

// This action creates a new note in Anki Mobile from the selected row using URL schemes. 
var _ = function(){
	
	var action = new PlugIn.Action(function(selection, sender) {
		// action code
		var columns = document.outline.columns
		if ((columns.byTitle('Deck') === null) || (columns.byTitle('Front') === null) || (columns.byTitle('Type') === null)) {
			var alertTitle = "Confirmation"
			var alertMessage = "Missing required columns.\nCreate a new template document?"
			var alert = new Alert(alertTitle, alertMessage)
			alert.addOption("Continue")
			alert.addOption("Stop")
			var alertPromise = alert.show()
			
			alertPromise.then(buttonIndex => {
				if (buttonIndex === 0){
					console.log("Continue script")
				
			
					Document.makeNew(function(doc){
						outline = doc.outline
						editor = doc.editors[0]
						
						outline.addColumn(
							Column.Type.Text, 
							editor.afterColumn(outline.outlineColumn), 
							function (column) {
								column.title = 'Back'
							}
						)
						outline.addColumn(
							Column.Type.Text, 
							editor.afterColumn(null), 
							function (column) {
								column.title = 'Tags'
							}
						)
						outline.addColumn(
							Column.Type.Text, 
							editor.afterColumn(null), 
							function (column) {
								column.title = 'Reference'
							}
						)
						outline.addColumn(
							Column.Type.Text, 
							editor.afterColumn(null), 
							function (column) {
								column.title = 'Extra'
							}
						)
						outline.addColumn(
							Column.Type.Enumeration, 
							editor.afterColumn(null), 
							function (column) {
								column.title = 'Reverse'
								column.enumeration.add('No')
								column.enumeration.add('Yes')
							}
						)
						
						outline.addColumn(
							Column.Type.Text, 
							editor.beforeColumn(outline.outlineColumn), 
							function (column) {
								column.title = 'Deck'
							}
						)
						outline.addColumn(
							Column.Type.Enumeration,
							editor.beforeColumn(outline.outlineColumn), 
							function (column) {
								column.title = 'Type'
								column.enumeration.add('Basic')
								column.enumeration.add('Cloze')
								column.enumeration.add('Input')
							}
						)
						baseItem = editor.rootNode.object
						baseItem.addChild(baseItem.beginning, function(item) {
							item.topic = 'This is the front text of a input card.'
							item.setValueForColumn(outline.columns.byTitle('Type').enumeration.memberNamed('Input'), outline.columns.byTitle('Type'))
							item.setValueForColumn('Academia', outline.columns.byTitle('Deck'))
							item.setValueForColumn('This is the back text for a input card.', outline.columns.byTitle('Back'))
							item.setValueForColumn('tag1 tag2', outline.columns.byTitle('Tags'))
							item.setValueForColumn('Wikipedia', outline.columns.byTitle('Reference'))
							item.setValueForColumn('Extra notes', outline.columns.byTitle('Extra'))
						})
						baseItem.addChild(baseItem.beginning, function(item) {
							item.topic = 'This is the {{c1::text}} of a {{c2::cloze card}}.'
							item.setValueForColumn(outline.columns.byTitle('Type').enumeration.memberNamed('Cloze'), outline.columns.byTitle('Type'))
							item.setValueForColumn('Academia', outline.columns.byTitle('Deck'))
							item.setValueForColumn('N/A', outline.columns.byTitle('Back'))
							item.setValueForColumn('tag1 tag2', outline.columns.byTitle('Tags'))
							item.setValueForColumn('Wikipedia', outline.columns.byTitle('Reference'))
							item.setValueForColumn('Extra notes', outline.columns.byTitle('Extra'))
						})
						baseItem.addChild(baseItem.beginning, function(item) {
							item.topic = 'This is the front text of a basic card.'
							item.setValueForColumn(outline.columns.byTitle('Type').enumeration.memberNamed('Basic'), outline.columns.byTitle('Type'))
							item.setValueForColumn('Academia', outline.columns.byTitle('Deck'))
							item.setValueForColumn('This is the back text for a basic card.', outline.columns.byTitle('Back'))
							item.setValueForColumn('tag1 tag2', outline.columns.byTitle('Tags'))
							item.setValueForColumn(outline.columns.byTitle('Reverse').enumeration.memberNamed('No'), outline.columns.byTitle('Reverse'))
							item.setValueForColumn('Wikipedia', outline.columns.byTitle('Reference'))
							item.setValueForColumn('Extra notes', outline.columns.byTitle('Extra'))
						})
						baseItem.addChild(baseItem.beginning, function(item) {
							item.topic = 'This is a template for the "Add to Anki" Omni Automation action. This action requires using appropriate configuration for card types in Anki. Three custom card types are defined with custom fields: {Basic: Front, Back, Reference, Reverse, Extra}, {Cloze: Text, Reference, Extra}, {Input: Front, Back, Reference, Extra}.'
						})
						doc.save()
						document.close()
					})
				} else {
					throw new Error('script cancelled')
				}
			})
			
		} else {
			// CREATE FORM FOR GATHERING USER INPUT
			var inputForm = new Form()
			
			// CREATE TEXT FIELD
			var profileField = new Form.Field.String(
				"profileInput",
				"Profile",
				null
			)
			
			// ADD THE FIELDS TO THE FORM
			inputForm.addField(profileField)
			
			// PRESENT THE FORM TO THE USER
			formPrompt = "Enter the Profile:"
			formPromise = inputForm.show(formPrompt,"Continue")
			
			// PROCESSING USING THE DATA EXTRACTED FROM THE FORM
			formPromise.then(function(formObject){
			
				// selection options: columns, document, editor, items, nodes, styles
				selection.items.forEach(function(item){
					try {front = item.topic} catch(err){front = ''}
					try {back = item.valueForColumn(columns.byTitle('Back')).string} catch(err){back=''}
					try {deck = item.valueForColumn(columns.byTitle('Deck')).string} catch(err){deck='Default'}
					try {type = item.valueForColumn(columns.byTitle('Type')).name} catch(err){type='Basic'}
					try {tags = item.valueForColumn(columns.byTitle('Tags')).string} catch(err){tags=''}
					try {reference = item.valueForColumn(columns.byTitle('Reference')).string} catch(err){reference=''}
					try {extra = item.valueForColumn(columns.byTitle('Extra')).string} catch(err){extra=''}
					try {reverse = item.valueForColumn(columns.byTitle('Reverse')).name} catch(err){reverse=''}
					if(front != ''){
						front = encodeURIComponent(front)
						back = encodeURIComponent(back)
						deck = encodeURIComponent(deck)
						type = encodeURIComponent(type)
						tags = encodeURIComponent(tags)
						if (type === 'Basic' || type === ''){
							urlStr = "anki://x-callback-url/addnote?profile=" + formObject.values["profileInput"] + "&type=" + type + "&deck=" + deck + "&fldFront=" + front + "&fldBack=" + back + "&tags=" + tags
							if (reverse === 'Yes') {
								urlStr = urlStr + "&fldReverse=Y"
							}
						} else if (type === 'Cloze'){
							urlStr = "anki://x-callback-url/addnote?profile=" + formObject.values["profileInput"] + "&type=" + type + "&deck=" + deck + "&fldText=" + front + "&tags=" + tags
						} else if (type === 'Input'){
							urlStr = "anki://x-callback-url/addnote?profile=" + formObject.values["profileInput"] + "&type=" + type + "&deck=" + deck + "&fldFront=" + front + "&fldBack=" + back + "&tags=" + tags
						}
						
						if(reference !== ''){urlStr = urlStr + "&fldReference=" + encodeURIComponent(reference)}
						if(extra !== ''){urlStr = urlStr + "&fldExtra=" + encodeURIComponent(extra)}
						URL.fromString(urlStr).call(function(result){})
						
					}
				})
			})
			
			// PROMISE FUNCTION CALLED UPON FORM CANCELLATION
			formPromise.catch(function(err){
				console.log("form cancelled", err.message)
			})
		}
	});

	action.validate = function(selection, sender) {
		// validation code
		// selection options: columns, document, editor, items, nodes, styles
		if(selection.items.length == 1){return true} else {return false}
	};
	
	return action;
}();
_;