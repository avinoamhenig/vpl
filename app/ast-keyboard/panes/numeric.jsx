import React from 'react'
import Icon from 'lib/Icon'
import { insertText } from './helpers'

export default (program, selectedExpId, dispatch) => ({
		display: (<Icon icon="hashtag" />),
		buttons: [
			{ display: '0'
			, handler: () => insertText(0, dispatch, program) },
			{ display: '1'
			, handler: () => insertText(1, dispatch, program) },
			{ display: '2'
			, handler: () => insertText(2, dispatch, program) },
			{ display: '3'
			, handler: () => insertText(3, dispatch, program) },
			{ display: '4'
			, handler: () => insertText(4, dispatch, program) },
			{ display: '5'
			, handler: () => insertText(5, dispatch, program) },
			{ display: '6'
			, handler: () => insertText(6, dispatch, program) },
			{ display: '7'
			, handler: () => insertText(7, dispatch, program) },
			{ display: '8'
			, handler: () => insertText(8, dispatch, program) },
			{ display: '9'
			, handler: () => insertText(9, dispatch, program) }
	]
});
