
Local $fileList = ""
For $i = 1 To $CmdLine[0]
   ;MsgBox($MB_SYSTEMMODAL, FileExists(GetFileName($CmdLine[$i])), GetFileName($CmdLine[$i]))
   If FileExists($CmdLine[$i]) Then
	  Local $f = $CmdLine[$i]
	  $fileList = $fileList & ' "' & $f & '"'
   EndIf
Next

FileChangeDir(@ScriptDir)
RunWait('node ../../build-filelist.js' & $fileList)