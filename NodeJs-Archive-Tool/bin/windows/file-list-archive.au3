#pragma compile(Icon, '../../assets/icon/file-list-archive.ico')

;Local $fileList = ""
FileChangeDir(@ScriptDir)
For $i = 1 To $CmdLine[0]
   ;MsgBox($MB_SYSTEMMODAL, FileExists(GetFileName($CmdLine[$i])), GetFileName($CmdLine[$i]))
   If FileExists($CmdLine[$i]) Then
	  Local $f = $CmdLine[$i]
	  ;$fileList = $fileList & ' "' & $f & '"'

      RunWait('node ../../file-list-archive.js "' & $f & '"', "", @SW_HIDE)
   EndIf
Next

