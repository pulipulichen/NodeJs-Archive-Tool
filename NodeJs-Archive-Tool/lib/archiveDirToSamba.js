const exec = require('child_process').exec;
const path = require('path')

/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
function execShellCommand(cmd) {
 return new Promise((resolve, reject) => {
  exec(cmd, (error, stdout, stderr) => {
   if (error) {
    console.warn(error);
   }
   resolve(stdout? stdout : stderr);
  });
 });
}

let path7z = "D:/xampp/htdocs/projects-autoit/AutoIt-Archive-Util/7-zip/7z.exe"
module.exports = function (sourceFolder, targetFolder) {
  
  //let sourceFolder = "D:\\Desktop\\20210626-archive-zotero-old-storage\\[document_1\\a"
  //let targetFolder = "\\\\NAS47ACE4\\home\\zotero\\"
  let f = path.basename(sourceFolder)
  let command = `"${path7z}" a -t7z -mx=9 "${targetFolder}${f}.7z" "${sourceFolder}"`
  return execShellCommand(command)
}
