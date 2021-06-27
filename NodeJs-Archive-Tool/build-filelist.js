const fs = require('fs')

let main = async function () {
  
  
  let output = []
  process.argv.forEach(function (val, index, array) {
    //console.log(index + ': ' + val);
    output.push(index + ': ' + val)
  });
  
  
  fs.writeFile(__dirname + '/t.txt', output.join('\n'), () => {})
  //console.log('Hello world.')
}

main()