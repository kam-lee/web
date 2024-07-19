fetch('123.txt')
  .then(response => {
    if (response.ok) {
      console.log('File exists and can be accessed.');
    } else {
      console.log('File does not exist or cannot be accessed.');
    }
  })
  .catch(error => console.error('Error checking file existence:', error));