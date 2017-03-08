# Tag Everything
Mongoose plugin that adds a tags path to your models.

## Installation
```
npm install mongoose-tag-everything
```
## Using in your app
```
var mongoose = require('mongoose');
var tagEnhance = require('mongoose-enhance-tag');

var animal = new mongoose.Schema({
    name: String
});
schema.plugin(tagEnhance);

### Custom path, collection, and model names
Pass the `path`, `collection`, or `ModelName` options to customize the respective names. It is recommended to load the plugin globally if any custom values are being used so there is consistency across models.


### for demo detail
# please just have a look in the test folder

## Running tests
```
npm test
```
