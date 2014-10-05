#Object Screen

Object screen is a tool for visualizing Javascript objects and their connections to each other.

##Setup
This projects needs the following libraries to work:
* [jQuery-2.1.1.js](http://code.jquery.com/jquery-2.1.1.js)
* [jquery-ui-1.11.1](http://jqueryui.com/download/all/#1-11-1)
* [jsPlumb 1.6.4](https://github.com/sporritt/jsPlumb/tree/c998527d89b4b893f9662e859748382a7155819b)

Place the files and folders under [./libs](./libs) and create the following folder strucuture
```
./jQuery-2.1.1.js
./jquery-ui-1.11.1/...
./jsPlumb 1.6.4/...
```

##Client usage
Open the [index.html](index.html) and add add objects through the different buttons.
* **+**:displays a new predefined object onto the screen
* **global**: loads and displays a variable from the global scope
* **JSON**: displays the parsed JSON String from the textarea on the right

**script**: you can display own objects by using ```provideObject(obj)```

##License
This project is MIT licensed by [Moritz Willig](http://www.rise-of-light.de). For the full license text see the [LICENSE File](LICENSE).