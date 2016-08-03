Set args = Wscript.Arguments
outputPath= Wscript.Arguments.Item(1)
scriptPath= Wscript.Arguments.Item(2)
rootFolder = Wscript.Arguments.Item(0)

Dim objStream
Dim File
Dim objFSO
Dim myInDesign
Dim reportFolder
Dim CoverIndesign
Dim inputinddpath

indesignscriptRootFolder = scriptPath+"\InDesign_Script"
indexjs = scriptPath+"\Post_Process_Script"
report = outputPath + "\Report"

Set objFSO = CreateObject("Scripting.FileSystemObject")

If Not objFSO.FolderExists(report) Then 
	reportFolder = objFSO.CreateFolder(report) 
End If

TraverseFolder rootFolder

Sub TraverseFolder(Folders)
    set folders1=objfso.getfolder(folders)
	For Each Subfolder in folders1.SubFolders
		if instr(subfolder.name,"_C") then 
			GetInDesignFile subfolder
		else
			if instr(subfolder.name,"_J") then 
				GetInDesignFile subfolder
			else
				if instr(subfolder.name,"_T") then 
					GetInDesignFile subfolder
				else
					TraverseFolder Subfolder
				end if
			
			end if
		end if
	Next
	
End Sub

Sub GetInDesignFile(Folders)

	set inDesignFolder=objfso.getfolder(folders)
	
	For Each inddFiles in inDesignFolder.Files
		if instr(inddFiles.name,"_C.indd") then 
			CoverIndesign = inddFiles
		else
			if instr(inddFiles.name,"_J.indd") then 
				CoverIndesign = inddFiles
			else 
				if instr(inddFiles.name,".indd") then 
					inputinddpath = inddFiles
				end if
			end if
		end if
	Next
End Sub

processePub CoverIndesign,inputinddpath

Sub processePub(CoverIndesign,inputinddpath)
	indesignscriptRootFolder = scriptPath+"\InDesign_Script"
	indexjs = scriptPath+"\Post_Process_Script"

	Set File = Nothing
	Set workFolder = Nothing
	Set myInDesign = CreateObject("InDesign.Application")
	Wscript.echo("InDesign Application Opened ....")

	If CoverIndesign <> "" then
		set cover=objFSO.getfile(CoverIndesign)
		Wscript.echo(cover.name + " Progressing ....")
		Set CoverFile = objFSO.CreateTextFile(indesignscriptRootFolder+"\Coverutils\InputTextFile.txt", 2, True)
		CoverFile.Write CoverIndesign + "," + reportFolder
		CoverFile.Close

		myJavaScript = indesignscriptRootFolder+"\Coverutils\Digitalcover.jsx"
		myInDesign.DoScript myJavaScript, 1246973031, Array("Hello from DoScript", "Your message here.")
		Wscript.echo(cover.name + " Progress Completed ....")
	End if
	
	set title=objFSO.getfile(inputinddpath)
	Wscript.echo(title.name + " Progressing ....")
	Set File = objFSO.CreateTextFile(indesignscriptRootFolder+"\testfile.txt", 2, True)
	File.Write inputinddpath + "," + reportFolder
	File.Close
	
	myJavaScript = indesignscriptRootFolder+"\InDD_ePub3.jsx"
	myInDesign.DoScript myJavaScript, 1246973031, Array("Hello from DoScript", "Your message here.")

	pageWiseImageScript = indesignscriptRootFolder+"\pageWiseImage.jsx"
	myInDesign.DoScript pageWiseImageScript, 1246973031, Array("Hello from DoScript", "Your message here.")

	Set File1 = objFSO.CreateTextFile(indesignscriptRootFolder+"\post.bat", True)
	File1.Write indexjs + "\exe\node.exe "+indexjs + "\index.js" + " -i "+inputinddpath + " -r "+ reportFolder
	File1.Close
	Set File1 = Nothing
	Set workFolder1 = Nothing
	Dim WinScriptHost
	Set WinScriptHost = CreateObject("WScript.Shell")
	WinScriptHost.Run ""& indesignscriptRootFolder+"\post.bat" &"", 0,1


	Set File11 = objFSO.CreateTextFile(indesignscriptRootFolder+"\post1.bat", True)
	File11.Write indexjs + "\exe\node.exe "+indexjs + "\index_folio.js" + " -i "+inputinddpath + " -r "+ reportFolder
	File11.Close
	Set File11 = Nothing
	Set workFolder11 = Nothing
	Dim WinScriptHost11
	Set WinScriptHost11 = CreateObject("WScript.Shell")
	WinScriptHost11.Run ""& indesignscriptRootFolder+"\post1.bat" &"", 0,1


	'COPY COVER and BACKCOVER
	outputFolder=myInDesign.activeDocument.filePath+"\Output\OEBPS\images"
	inputFolderpath=indesignscriptRootFolder+"\Coverutils\PromoPdf\pdfs"
	Set copyFile1 = objFSO.CreateTextFile(indesignscriptRootFolder+"\copy.bat", True)
	copyFile1.writeline "copy " &  inputFolderpath+"\Cover.jpg "+outputFolder+"\cover.jpg"
	copyFile1.writeline "copy " &  inputFolderpath+"\Backcover.jpg "+outputFolder+"\backcover.jpg"
	copyFile1.Close
	Set copyFile1 = Nothing
	Set workFolder1 = Nothing
	Dim WinScriptHost1
	Set WinScriptHost1= CreateObject("WScript.Shell")
	WinScriptHost1.Run ""& indesignscriptRootFolder+"\copy.bat" &"", 0,1


	Set myDocument = myInDesign.activeDocument


	'OPF CREATION
	strFolder1 = myInDesign.activeDocument.filePath+"\Output"
	objStartFolder = strFolder1+"\"
	Set objStream = CreateObject("ADODB.Stream")
	objStream.Charset = "utf-8"
	objStream.Open
	objStream.WriteText "<?xml version=""1.0"" encoding=""UTF-8"" standalone=""yes""?>" & Chr(13)  

	Set Manifest = Nothing
	objStream.WriteText "<package version=""3.0"" xmlns=""http://www.idpf.org/2007/opf"" unique-identifier=""bookid"">"  & Chr(13)
	objStream.WriteText "<metadata xmlns:dc=""http://purl.org/dc/elements/1.1/"">" & Chr(13)
	objStream.WriteText "<meta name=""cover-image"" content=""cover.jpg""></meta>" & Chr(13)
	objStream.WriteText "<dc:title>Title</dc:title>" & Chr(13) 
	objStream.WriteText "<dc:creator>Creator</dc:creator>" & Chr(13) 
	objStream.WriteText "<dc:publisher>Publisher</dc:publisher>" & Chr(13) 
	objStream.WriteText "<dc:rights>Copyright</dc:rights>" & Chr(13) 
	objStream.WriteText "<dc:language>en-US</dc:language>" & Chr(13) 
	objStream.WriteText "<dc:identifier id=""bookid"">ISBN</dc:identifier>" & Chr(13)
	objStream.WriteText "<meta property=""dcterms:modified"">2016-04-29T18:00:00Z</meta>" & Chr(13)
	objStream.WriteText "<meta property=""rendition:layout"">pre-paginated</meta>" & Chr(13)
	objStream.WriteText "<meta property=""rendition:orientation"">auto</meta>" & Chr(13)
	objStream.WriteText "<meta property=""rendition:spread"">both</meta>" & Chr(13)
	objStream.WriteText "<meta property=""media:active-class"">-epub-media-overlay-active</meta>" & Chr(13)
	objStream.WriteText "</metadata>" & Chr(13)
	objStream.WriteText "<manifest>" & Chr(13)
	OEBPSFiles objFSO.GetFolder(objStartFolder)
	objStream.WriteText "</manifest>" & Chr(13)
	objStream.WriteText "<spine>" & Chr(13)
	OEBPSFoldersSpine objFSO.GetFolder(objStartFolder)
	objStream.WriteText "<itemref idref=""backcover-html"" />" & Chr(13)
	objStream.WriteText "</spine>" & Chr(13)
	objStream.WriteText "</package>" 
	objStream.SaveToFile objStartFolder+"\OEBPS\content.opf", 2
	Wscript.Echo "OPF created successfully"

	'Zip the Files
	outputFolder=myInDesign.activeDocument.filePath+"\Output"
	ScriptFolder=indesignscriptRootFolder
	sScriptDir = objFSO.GetParentFolderName(WScript.ScriptFullName)
	strDrive = objFSO.GetDriveName(sScriptDir)

	EpubName= myInDesign.activeDocument.name
	EpubName = left(EpubName,instr(1,EpubName,".")-1)

	Set File1 = objFSO.CreateTextFile(ScriptFolder+"\zipcreation.bat", True)
	File1.writeline "copy " &  ScriptFolder+"\zip.exe "+outputFolder+"\zip.exe" 
	File1.writeline strDrive
	File1.writeline "cd "+outputFolder
	File1.writeline "zip -Xr9D "+outputFolder+"\"+EpubName+".epub "+"mimetype "+"META-INF\* "+"OEBPS\*"
	File1.writeline "copy " &  outputFolder+"\"+EpubName+".epub "+outputPath+"\"+EpubName+".epub" 
	File1.Close
	Set WinScriptHost = CreateObject("WScript.Shell")
	WinScriptHost.Run ""& ScriptFolder+"\zipcreation.bat" &"", 0,1
	Wscript.Echo "zip/epub created successfully"

	myInDesign.activeDocument.close()
end sub

Sub OEBPSFolders(Folder)
	For Each Subfolder in Folder.SubFolders
		if instr(subfolder.name,"OEBPS") then 
			OEBPSFiles(subfolder)
		else 
			OEBPSFolders subfolder
		end if
	Next
End Sub

Function OEBPSFiles(Folder)
	For Each Subfolder in Folder.SubFolders
		OEBPSFiles Subfolder
	Next
	For Each objFile in Folder.Files
		extension=objFSO.GetExtensionName(objFile)

		if extension = "html" then
			str = objFile.name
			str = left(str,instr(1,str,".")-1)
			if str = "nav" then
				objStream.WriteText "<item id="""+str + "-html" +""" href=""html/"+objFile.name+""" properties = ""nav"" media-type=""application/xhtml+xml""/>" & Chr(13)
			else 
				objStream.WriteText "<item id="""+str + "-html" +""" href=""html/"+objFile.name+""" media-type=""application/xhtml+xml""/>" & Chr(13)
			end if
		End if
		
		if extension = "xhtml" then
			str = objFile.name
			str = left(str,instr(1,str,".")-1)
			if str = "nav" then
				objStream.WriteText "<item id="""+str + "-html" +""" href=""html/"+objFile.name+""" properties = ""nav"" media-type=""application/xhtml+xml""/>" & Chr(13)
			else 
				objStream.WriteText "<item id="""+str + "-html" +""" href=""html/"+objFile.name+""" media-type=""application/xhtml+xml""/>" & Chr(13)
			end if
		End if
		
		if extension = "jpg" then
			str = objFile.name
			str = left(str,instr(1,str,".")-1)
			objStream.WriteText "<item id="""+str + "-image" +""" href=""images/"+objFile.name+""" media-type=""image/jpeg""/>" & Chr(13)
		End if

		if extension = "png" then
			str = objFile.name
			str = left(str,instr(1,str,".")-1)
			objStream.WriteText "<item id="""+str + "-image" +""" href=""images/"+objFile.name+""" media-type=""image/png""/>" & Chr(13)
		End if

		if extension = "png" then
			str = objFile.name
			str = left(str,instr(1,str,".")-1)
			objStream.WriteText "<item id="""+str + "-smil" +""" href=""smil/"+objFile.name+""" media-type=""application/smil+xml""/>" & Chr(13)
		End if
		
		if extension = "mp3" then
			str = objFile.name
			str = left(str,instr(1,str,".")-1)
			objStream.WriteText "<item id="""+str + "-audio" +""" href=""audio/"+objFile.name+""" media-type=""audio/mpeg""/>" & Chr(13)
		End if
		
		if extension = "css" then
			str = objFile.name
			str = left(str,instr(1,str,".")-1)
			objStream.WriteText "<item id="""+str + "-css" +""" href=""css/"+objFile.name+""" media-type=""text/css""/>" & Chr(13)
		End if
		
		if extension = "otf" then
			str = objFile.name
			str = left(str,instr(1,str,".")-1)
			objStream.WriteText "<item id="""+str + "-font" +""" href=""font/"+objFile.name+""" media-type=""application/x-font-otf""/>" & Chr(13)
		End if	
		
		if extension = "ttf" then
			str = objFile.name
			str = left(str,instr(1,str,".")-1)
			objStream.WriteText "<item id="""+str + "-font" +""" href=""font/"+objFile.name+""" media-type=""application/x-font-ttf""/>" & Chr(13)
		End if		
		
		if extension = "ncx" then
			str = objFile.name
			str = left(str,instr(1,str,".")-1)
			objStream.WriteText "<item id="""+"ncx" + "" +""" href="""+objFile.name+""" media-type=""application/x-dtbncx+xml""/>" & Chr(13)
		End if
	Next
End Function

Sub OEBPSFoldersSpine(Folder)
	For Each Subfolder in Folder.SubFolders
		if instr(subfolder.name,"OEBPS") then 
			OEBPSFilesSpine(subfolder)
		else 
			OEBPSFoldersSpine subfolder
		end if
	Next
End Sub

Function OEBPSFilesSpine(Folder)
	For Each Subfolder in Folder.SubFolders
		OEBPSFilesSpine Subfolder
	Next
	For Each objFile in Folder.Files
		extension=objFSO.GetExtensionName(objFile)

		if extension = "html" then
			str = objFile.name
			str = left(str,instr(1,str,".")-1)
			if str = "nav" then
				
			else 
				if str = "backcover" then
				
				else
					objStream.WriteText "<itemref idref="""+str + "-html" +""" />" & Chr(13)
				end if
			end if
		End if
		
		if extension = "xhtml" then
			str = objFile.name
			str = left(str,instr(1,str,".")-1)
			if str = "nav" then
				
			else 
				if str = "backcover" then
				
				else
					objStream.WriteText "<itemref idref="""+str + "-html" +""" />" & Chr(13)
				end if
			end if
		End if
	Next
End Function

myInDesign.quit 
Wscript.Sleep 7000
Wscript.Echo "completed"