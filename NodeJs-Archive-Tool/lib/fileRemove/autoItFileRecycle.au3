For $i = 1 To $CmdLine[0]
   If FileExists($CmdLine[$i]) Then
	  Local $f = $CmdLine[$i]
	  FileRecycle ( $f )
   EndIf
Next



