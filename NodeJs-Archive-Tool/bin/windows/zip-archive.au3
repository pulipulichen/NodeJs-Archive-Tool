#pragma compile(Icon, '../../assets/icon/zip-icon.ico')


FileChangeDir(@ScriptDir)

Local $jsFilename = "zip-archive"
Local $fileList = ""
For $i = 1 To $CmdLine[0]
   ;MsgBox($MB_SYSTEMMODAL, FileExists(GetFileName($CmdLine[$i])), GetFileName($CmdLine[$i]))
   If FileExists($CmdLine[$i]) Then
	  Local $f = $CmdLine[$i]
	  $fileList = $fileList & ' "' & $f & '"'

    ;RunWait('node ../../7z-archive.js "' & $f & '"', "", @SW_HIDE)
   EndIf
Next

RunWait('node ../../' & $jsFilename &'.js'& $fileList, "", @SW_HIDE)

