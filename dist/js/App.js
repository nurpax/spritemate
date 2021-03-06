"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// ASCII text: http://patorjk.com/software/taag/#p=display&h=2&f=Doh&t=KEYS


/*

  To switch to photoshop style layers:
  - load "List_layerstyle.js" instead of "List.js" in index.html
  - comment & uncomment 2 lines of code in update_ui in this file

*/

function init() {
  var sprite_app = new App(get_config());
}

var App = function () {
  function App(config) {
    _classCallCheck(this, App);

    this.storage = new Storage(config);
    this.config = this.storage.get_config();
    this.config.colors = this.config.palettes[this.config.selected_palette];

    this.sprite = new Sprite(this.config);

    // editor
    var window_config = { name: "window_editor", title: "Editor", type: "sprite", resizable: false, left: this.config.window_editor.left, top: this.config.window_editor.top, width: "auto", height: "auto" };
    this.window_editor = new Window(window_config, this.store_window.bind(this));
    this.editor = new Editor(0, this.config);

    // palette
    window_config = { name: "window_palette", title: "Colors", type: "colors", resizable: false, left: this.config.window_palette.left, top: this.config.window_palette.top, width: "auto", height: "auto" };
    this.window_palette = new Window(window_config, this.store_window.bind(this));
    this.palette = new Palette(1, this.config);

    // preview
    window_config = { name: "window_preview", title: "Preview", type: "preview", resizable: false, left: this.config.window_preview.left, top: this.config.window_preview.top, width: "auto", height: "auto" };
    this.window_preview = new Window(window_config, this.store_window.bind(this));
    this.preview = new Preview(2, this.config);

    // sprite list
    window_config = { name: "window_list", title: "Sprite List", type: "list", resizable: true, left: this.config.window_list.left, top: this.config.window_list.top, width: this.config.window_list.width, height: this.config.window_list.height };
    this.window_list = new Window(window_config, this.store_window.bind(this));
    this.list = new List(3, this.config);

    // info
    window_config = { name: "window_info", title: "Spritemate", type: "info", escape: true, modal: true, resizable: false, autoOpen: false, width: 640, height: "auto" };
    this.window_info = new Window(window_config);
    this.info = new Info(4, this.config);

    // save
    window_config = { name: "window_save", title: "Save", type: "file", escape: true, modal: true, resizable: false, autoOpen: false, width: 580, height: "auto" };
    this.window_save = new Window(window_config);
    this.save = new Save(5, this.config, { onLoad: this.regain_keyboard_controls.bind(this) });

    // settings
    window_config = { name: "window_settings,", title: "Settings", type: "settings", modal: true, escape: true, resizable: false, autoOpen: false, width: 760, height: "auto" };
    this.window_settings = new Window(window_config);
    this.settings = new Settings(7, this.config, { onLoad: this.update_config.bind(this) });

    // help
    window_config = { name: "window_help", title: "Help", type: "info", escape: true, modal: true, resizable: false, autoOpen: false, width: 640, height: "auto" };
    this.window_help = new Window(window_config);
    this.help = new Help(8, this.config);

    // menu
    window_config = { name: "window_menu", title: "Menu", type: "menu", resizable: false, left: this.config.window_menu.left, top: this.config.window_menu.top, width: "auto", height: "auto" };
    this.window_menu = new Window(window_config, this.store_window.bind(this));
    this.menu = new Menu(9, this.config);

    this.load = new Load(this.config, { onLoad: this.update_loaded_file.bind(this) });

    this.is_drawing = false;
    this.oldpos = { x: 0, y: 0 }; // used when drawing and moving the mouse in editor
    this.sprite.new(this.palette.get_color());

    this.mode = "draw"; // modes can be "draw" and "fill"
    this.allow_keyboard_shortcuts = true;

    $(document).tooltip({ show: { delay: 1000 } }); // initializes tooltip handling in jquery

    tipoftheday();

    this.list.update_all(this.sprite.get_all());
    this.update();
    this.user_interaction();

    if (this.storage.is_updated_version()) $("#window-4").dialog("open");
  }

  _createClass(App, [{
    key: "toggle_fullscreen",
    value: function toggle_fullscreen() {
      if (!document.fullscreenElement && // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
        // current working methods
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
          document.documentElement.msRequestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
          document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    }
  }, {
    key: "update",
    value: function update() {
      var all = this.sprite.get_all();

      this.editor.update(all);
      this.preview.update(all);
      this.list.update(all);
      this.palette.update(all);
      this.update_ui();
    }
  }, {
    key: "update_ui",
    value: function update_ui() {

      if (this.sprite.get_number_of_sprites() > 1) {
        $('#icon-list-delete').fadeTo("fast", 1);
      } else {
        $('#icon-list-delete').fadeTo("fast", 0.33);
      }

      if (this.sprite.is_copy_empty()) {
        $('#icon-list-paste').fadeTo("fast", 0.33);
      } else {
        $('#icon-list-paste').fadeTo("fast", 1);
      }

      if (this.sprite.can_undo()) {
        $('#icon-undo').fadeTo("fast", 1);
      } else {
        $('#icon-undo').fadeTo("fast", 0.33);
      }

      if (this.sprite.can_redo()) {
        $('#icon-redo').fadeTo("fast", 1);
      } else {
        $('#icon-redo').fadeTo("fast", 0.33);
      }

      if (this.sprite.is_overlay()) {
        $('#icon-preview-overlay').attr("src", "img/icon3/icon-preview-overlay-hi.png");
      } else {
        $('#icon-preview-overlay').attr("src", "img/icon3/icon-preview-overlay.png");
      }

      if (this.preview.is_min_zoom()) {
        $('#icon-preview-zoom-out').fadeTo("fast", 0.33);
      } else {
        $('#icon-preview-zoom-out').fadeTo("fast", 1);
      }

      if (this.preview.is_max_zoom()) {
        $('#icon-preview-zoom-in').fadeTo("fast", 0.33);
      } else {
        $('#icon-preview-zoom-in').fadeTo("fast", 1);
      }

      if (this.editor.is_min_zoom()) {
        $('#icon-editor-zoom-out').fadeTo("fast", 0.33);
      } else {
        $('#icon-editor-zoom-out').fadeTo("fast", 1);
      }

      if (this.editor.is_max_zoom()) {
        $('#icon-editor-zoom-in').fadeTo("fast", 0.33);
      } else {
        $('#icon-editor-zoom-in').fadeTo("fast", 1);
      }

      if (this.list.is_min_zoom()) {
        $('#icon-list-zoom-out').fadeTo("fast", 0.33);
      } else {
        $('#icon-list-zoom-out').fadeTo("fast", 1);
      }

      if (this.list.is_max_zoom()) {
        $('#icon-list-zoom-in').fadeTo("fast", 0.33);
      } else {
        $('#icon-list-zoom-in').fadeTo("fast", 1);
      }

      // photoshop style layer
      //$('.sprite_layer').removeClass("sprite_layer_selected");
      //$('#spritelist').find('#'+this.sprite.get_current_sprite_number()).addClass("sprite_layer_selected");


      // spritepad style layer
      $('.sprite_in_list').removeClass("sprite_in_list_selected");
      $('#spritelist').find('#' + this.sprite.get_current_sprite_number()).addClass("sprite_in_list_selected");
    }
  }, {
    key: "store_window",
    value: function store_window(obj) {
      // check which data is in the object, compare with config data of that window
      // and replace the data in the config if matching
      // then save to storage
      for (var key in obj.data) {
        if (this.config[obj.name].hasOwnProperty(key)) this.config[obj.name][key] = obj.data[key];
      }
      this.storage.write(this.config);
    }
  }, {
    key: "update_config",
    value: function update_config() {
      // this gets called after the settings modal has been closed
      this.palette.set_colors(this.config.colors);
      this.storage.write(this.config);
      this.list.update_all(this.sprite.get_all());
      this.update();
      status("Configuration updated.");
    }
  }, {
    key: "update_loaded_file",
    value: function update_loaded_file() {
      // called as a callback event from the load class
      // after a file got loaded in completely
      this.sprite.set_all(this.load.get_imported_file());
      this.list.update_all(this.sprite.get_all());
      this.update();
    }
  }, {
    key: "regain_keyboard_controls",
    value: function regain_keyboard_controls() {
      // this will be called whenever keyboard controls have been deactivated, e.g. for input fields
      // currently used as callback after the save dialog
      this.allow_keyboard_shortcuts = true;
    }
  }, {
    key: "init_ui_fade",
    value: function init_ui_fade(element) {
      $('#' + element).mouseenter(function (e) {
        $('#' + element).stop(true, true).animate({ backgroundColor: 'rgba(90,90,90,0.5)' }, 'fast');
      });
      $('#' + element).mouseleave(function (e) {
        $('#' + element).stop(true, true).animate({ backgroundColor: 'transparent' }, 'fast');
      });
    }
  }, {
    key: "user_interaction",
    value: function user_interaction() {
      var _this = this;

      // init hover effects for all menu items
      this.init_ui_fade("icon-load");
      this.init_ui_fade("icon-save");
      this.init_ui_fade("icon-undo");
      this.init_ui_fade("icon-redo");
      this.init_ui_fade("icon-editor-grid");
      this.init_ui_fade("icon-shift-left");
      this.init_ui_fade("icon-shift-right");
      this.init_ui_fade("icon-shift-up");
      this.init_ui_fade("icon-shift-down");
      this.init_ui_fade("icon-flip-horizontal");
      this.init_ui_fade("icon-flip-vertical");
      this.init_ui_fade("icon-multicolor");
      this.init_ui_fade("icon-draw");
      this.init_ui_fade("icon-fill");
      this.init_ui_fade("icon-fullscreen");
      this.init_ui_fade("icon-info");
      this.init_ui_fade("icon-help");
      this.init_ui_fade("icon-settings");
      this.init_ui_fade("icon-list-new");
      this.init_ui_fade("icon-list-copy");
      this.init_ui_fade("icon-list-paste");
      this.init_ui_fade("icon-list-grid");
      this.init_ui_fade("icon-list-zoom-in");
      this.init_ui_fade("icon-list-zoom-out");
      this.init_ui_fade("icon-editor-zoom-in");
      this.init_ui_fade("icon-editor-zoom-out");
      this.init_ui_fade("icon-preview-zoom-in");
      this.init_ui_fade("icon-preview-zoom-out");
      this.init_ui_fade("icon-preview-overlay");
      this.init_ui_fade("icon-preview-x");
      this.init_ui_fade("icon-preview-y");

      // delete is a bit different
      $('#icon-list-delete').css({ opacity: 0.20 });
      $('#icon-list-delete').mouseenter(function (e) {
        if (!_this.sprite.only_one_sprite()) $('#icon-list-delete').animate({ backgroundColor: 'rgba(0,0,0,0.5)' }, 'fast');
      });
      $('#icon-list-delete').mouseleave(function (e) {
        if (!_this.sprite.only_one_sprite()) $('#icon-list-delete').animate({ backgroundColor: 'transparent' }, 'fast');
      });

      $('#icon-select').css({ opacity: 0.20 });

      /*
      
      KKKKKKKKK    KKKKKKK   EEEEEEEEEEEEEEEEEEEEEE   YYYYYYY       YYYYYYY      SSSSSSSSSSSSSSS 
      K:::::::K    K:::::K   E::::::::::::::::::::E   Y:::::Y       Y:::::Y    SS:::::::::::::::S
      K:::::::K    K:::::K   E::::::::::::::::::::E   Y:::::Y       Y:::::Y   S:::::SSSSSS::::::S
      K:::::::K   K::::::K   EE::::::EEEEEEEEE::::E   Y::::::Y     Y::::::Y   S:::::S     SSSSSSS
      KK::::::K  K:::::KKK     E:::::E       EEEEEE   YYY:::::Y   Y:::::YYY   S:::::S            
        K:::::K K:::::K        E:::::E                   Y:::::Y Y:::::Y      S:::::S            
        K::::::K:::::K         E::::::EEEEEEEEEE          Y:::::Y:::::Y        S::::SSSS         
        K:::::::::::K          E:::::::::::::::E           Y:::::::::Y          SS::::::SSSSS    
        K:::::::::::K          E:::::::::::::::E            Y:::::::Y             SSS::::::::SS  
        K::::::K:::::K         E::::::EEEEEEEEEE             Y:::::Y                 SSSSSS::::S 
        K:::::K K:::::K        E:::::E                       Y:::::Y                      S:::::S
      KK::::::K  K:::::KKK     E:::::E       EEEEEE          Y:::::Y                      S:::::S
      K:::::::K   K::::::K   EE::::::EEEEEEEE:::::E          Y:::::Y          SSSSSSS     S:::::S
      K:::::::K    K:::::K   E::::::::::::::::::::E       YYYY:::::YYYY       S::::::SSSSSS:::::S
      K:::::::K    K:::::K   E::::::::::::::::::::E       Y:::::::::::Y       S:::::::::::::::SS 
      KKKKKKKKK    KKKKKKK   EEEEEEEEEEEEEEEEEEEEEE       YYYYYYYYYYYYY        SSSSSSSSSSSSSSS  
      
      */

      $(document).keydown(function (e) {
        //console.log(e.key);
        if (_this.allow_keyboard_shortcuts) {
          if (e.key == "a") {
            console.time('performance');
            for (var i = 0; i <= 1000; i++) {
              _this.update();
            }console.timeEnd('performance');
          }

          if (e.key == "ArrowRight") {
            _this.sprite.set_current_sprite("right");
            _this.update();
          }
          if (e.key == "ArrowLeft") {
            _this.sprite.set_current_sprite("left");
            _this.update();
          }

          if (e.key == "f") {
            _this.toggle_fullscreen();
          }

          if (e.key == "q") {
            //this.sprite.set_all(example_sprite);
            _this.list.update_all(_this.sprite.get_all());
            _this.update();
          }

          if (e.key == "d") {
            // toggle between draw and fill modes
            if (_this.mode == "draw") {
              _this.mode = "fill";
              status("Fill mode");
              $("#image-icon-draw").attr("src", "img/icon3/icon-draw.png");
              $("#image-icon-select").attr("src", "img/icon3/icon-select.png");
              $("#image-icon-fill").attr("src", "img/icon3/icon-fill-hi.png");
            } else {
              _this.mode = "draw";
              status("Draw mode");
              $("#image-icon-draw").attr("src", "img/icon3/icon-draw-hi.png");
              $("#image-icon-select").attr("src", "img/icon3/icon-select.png");
              $("#image-icon-fill").attr("src", "img/icon3/icon-fill.png");
            }
          }

          if (e.key == "1") {
            _this.sprite.set_pen("i");
            _this.update();
          }

          if (e.key == "2") {
            _this.sprite.set_pen("t");
            _this.update();
          }

          if (e.key == "3" && _this.sprite.is_multicolor()) {
            _this.sprite.set_pen("m1");
            _this.update();
          }

          if (e.key == "4" && _this.sprite.is_multicolor()) {
            _this.sprite.set_pen("m2");
            _this.update();
          }

          if (e.key == "z") {
            _this.sprite.undo();
            _this.update();
          }

          if (e.key == "Z") {
            _this.sprite.redo();
            _this.update();
          }

          if (e.key == "m") {
            _this.sprite.toggle_multicolor();
            _this.update();
          }
        }
      });

      /*
      
      MMMMMMMM               MMMMMMMM   EEEEEEEEEEEEEEEEEEEEEE   NNNNNNNN        NNNNNNNN   UUUUUUUU     UUUUUUUU
      M:::::::M             M:::::::M   E::::::::::::::::::::E   N:::::::N       N::::::N   U::::::U     U::::::U
      M::::::::M           M::::::::M   E::::::::::::::::::::E   N::::::::N      N::::::N   U::::::U     U::::::U
      M:::::::::M         M:::::::::M   EE::::::EEEEEEEEE::::E   N:::::::::N     N::::::N   UU:::::U     U:::::UU
      M::::::::::M       M::::::::::M     E:::::E       EEEEEE   N::::::::::N    N::::::N    U:::::U     U:::::U 
      M:::::::::::M     M:::::::::::M     E:::::E                N:::::::::::N   N::::::N    U:::::D     D:::::U 
      M:::::::M::::M   M::::M:::::::M     E::::::EEEEEEEEEE      N:::::::N::::N  N::::::N    U:::::D     D:::::U 
      M::::::M M::::M M::::M M::::::M     E:::::::::::::::E      N::::::N N::::N N::::::N    U:::::D     D:::::U 
      M::::::M  M::::M::::M  M::::::M     E:::::::::::::::E      N::::::N  N::::N:::::::N    U:::::D     D:::::U 
      M::::::M   M:::::::M   M::::::M     E::::::EEEEEEEEEE      N::::::N   N:::::::::::N    U:::::D     D:::::U 
      M::::::M    M:::::M    M::::::M     E:::::E                N::::::N    N::::::::::N    U:::::D     D:::::U 
      M::::::M     MMMMM     M::::::M     E:::::E       EEEEEE   N::::::N     N:::::::::N    U::::::U   U::::::U 
      M::::::M               M::::::M   EE::::::EEEEEEEE:::::E   N::::::N      N::::::::N    U:::::::UUU:::::::U 
      M::::::M               M::::::M   E::::::::::::::::::::E   N::::::N       N:::::::N     UU:::::::::::::UU  
      M::::::M               M::::::M   E::::::::::::::::::::E   N::::::N        N::::::N       UU:::::::::UU    
      MMMMMMMM               MMMMMMMM   EEEEEEEEEEEEEEEEEEEEEE   NNNNNNNN         NNNNNNN         UUUUUUUUU  
      
      
      
      */

      $('#icon-load').mouseup(function (e) {
        $("#input-load").trigger("click");
      });

      $('#icon-save').mouseup(function (e) {
        _this.allow_keyboard_shortcuts = false;
        $("#window-5").dialog("open");
        _this.save.set_save_data(_this.sprite.get_all());
      });

      $('#icon-undo').mouseup(function (e) {
        _this.sprite.undo();
        _this.list.update_all(_this.sprite.get_all());
        _this.update();
      });

      $('#icon-redo').mouseup(function (e) {
        _this.sprite.redo();
        _this.list.update_all(_this.sprite.get_all());
        _this.update();
      });

      $('#icon-draw').mouseup(function (e) {
        _this.mode = "draw";
        status("Draw mode");
        $("#image-icon-draw").attr("src", "img/icon3/icon-draw-hi.png");
        $("#image-icon-select").attr("src", "img/icon3/icon-select.png");
        $("#image-icon-fill").attr("src", "img/icon3/icon-fill.png");
      });

      $('#icon-fill').mouseup(function (e) {
        _this.mode = "fill";
        status("Fill mode");
        $("#image-icon-draw").attr("src", "img/icon3/icon-draw.png");
        $("#image-icon-select").attr("src", "img/icon3/icon-select.png");
        $("#image-icon-fill").attr("src", "img/icon3/icon-fill-hi.png");
      });

      $('#icon-fullscreen').mouseup(function (e) {
        _this.toggle_fullscreen();
      });

      $('#icon-settings').mouseup(function (e) {
        $("#window-7").dialog("open");
        _this.allow_keyboard_shortcuts = false;
      });

      $('#icon-info').mouseup(function (e) {
        $("#window-4").dialog("open");
      });

      $('#icon-help').mouseup(function (e) {
        $("#window-8").dialog("open");
      });

      /*
      
              CCCCCCCCCCCCC     OOOOOOOOO     LLLLLLLLLLL                  OOOOOOOOO     RRRRRRRRRRRRRRRRR      SSSSSSSSSSSSSSS 
           CCC::::::::::::C   OO:::::::::OO   L:::::::::L                OO:::::::::OO   R::::::::::::::::R   SS:::::::::::::::S
         CC:::::::::::::::C OO:::::::::::::OO L:::::::::L              OO:::::::::::::OO R::::::RRRRRR:::::R S:::::SSSSSS::::::S
        C:::::CCCCCCCC::::CO:::::::OOO:::::::OLL:::::::LL             O:::::::OOO:::::::ORR:::::R     R:::::RS:::::S     SSSSSSS
       C:::::C       CCCCCCO::::::O   O::::::O  L:::::L               O::::::O   O::::::O  R::::R     R:::::RS:::::S            
      C:::::C              O:::::O     O:::::O  L:::::L               O:::::O     O:::::O  R::::R     R:::::RS:::::S            
      C:::::C              O:::::O     O:::::O  L:::::L               O:::::O     O:::::O  R::::RRRRRR:::::R  S::::SSSS         
      C:::::C              O:::::O     O:::::O  L:::::L               O:::::O     O:::::O  R:::::::::::::RR    SS::::::SSSSS    
      C:::::C              O:::::O     O:::::O  L:::::L               O:::::O     O:::::O  R::::RRRRRR:::::R     SSS::::::::SS  
      C:::::C              O:::::O     O:::::O  L:::::L               O:::::O     O:::::O  R::::R     R:::::R       SSSSSS::::S 
      C:::::C              O:::::O     O:::::O  L:::::L               O:::::O     O:::::O  R::::R     R:::::R            S:::::S
       C:::::C       CCCCCCO::::::O   O::::::O  L:::::L         LLLLLLO::::::O   O::::::O  R::::R     R:::::R            S:::::S
        C:::::CCCCCCCC::::CO:::::::OOO:::::::OLL:::::::LLLLLLLLL:::::LO:::::::OOO:::::::ORR:::::R     R:::::RSSSSSSS     S:::::S
         CC:::::::::::::::C OO:::::::::::::OO L::::::::::::::::::::::L OO:::::::::::::OO R::::::R     R:::::RS::::::SSSSSS:::::S
           CCC::::::::::::C   OO:::::::::OO   L::::::::::::::::::::::L   OO:::::::::OO   R::::::R     R:::::RS:::::::::::::::SS 
              CCCCCCCCCCCCC     OOOOOOOOO     LLLLLLLLLLLLLLLLLLLLLLLL     OOOOOOOOO     RRRRRRRR     RRRRRRR SSSSSSSSSSSSSSS   
      
      */

      $('#palette_all_colors').mouseup(function (e) {
        _this.palette.set_active_color(e);
        _this.sprite.set_pen_color(_this.palette.get_color());
        _this.list.update_all(_this.sprite.get_all());
        _this.update();
      });

      $('#palette_i').mouseup(function (e) {
        _this.sprite.set_pen("i");
        _this.update();
      });

      $('#palette_t').mouseup(function (e) {
        _this.sprite.set_pen("t");
        _this.update();
      });

      $('#palette_m1').mouseup(function (e) {
        _this.sprite.set_pen("m1");
        _this.update();
      });

      $('#palette_m2').mouseup(function (e) {
        _this.sprite.set_pen("m2");
        _this.update();
      });

      /* 
      
      EEEEEEEEEEEEEEEEEEEEEE   DDDDDDDDDDDDD         IIIIIIIIII   TTTTTTTTTTTTTTTTTTTTTTT    
      E::::::::::::::::::::E   D::::::::::::DDD      I::::::::I   T:::::::::::::::::::::T 
      E::::::::::::::::::::E   D:::::::::::::::DD    I::::::::I   T:::::::::::::::::::::T
      EE::::::EEEEEEEEE::::E   DDD:::::DDDDD:::::D   II::::::II   T:::::TT:::::::TT:::::T
        E:::::E       EEEEEE     D:::::D    D:::::D    I::::I     TTTTTT  T:::::T  TTTTTT
        E:::::E                  D:::::D     D:::::D   I::::I             T:::::T        
        E::::::EEEEEEEEEE        D:::::D     D:::::D   I::::I             T:::::T        
        E:::::::::::::::E        D:::::D     D:::::D   I::::I             T:::::T         
        E:::::::::::::::E        D:::::D     D:::::D   I::::I             T:::::T        
        E::::::EEEEEEEEEE        D:::::D     D:::::D   I::::I             T:::::T        
        E:::::E                  D:::::D     D:::::D   I::::I             T:::::T       
        E:::::E       EEEEEE     D:::::D    D:::::D    I::::I             T:::::T       
      EE::::::EEEEEEEE:::::E   DDD:::::DDDDD:::::D   II::::::II         TT:::::::TT     
      E::::::::::::::::::::E   D:::::::::::::::DD    I::::::::I         T:::::::::T     
      E::::::::::::::::::::E   D::::::::::::DDD      I::::::::I         T:::::::::T      
      EEEEEEEEEEEEEEEEEEEEEE   DDDDDDDDDDDDD         IIIIIIIIII         TTTTTTTTTTT        
      
      */

      $('#editor').mousedown(function (e) {
        if (_this.mode == "draw") {
          _this.sprite.set_pixel(_this.editor.get_pixel(e), e.shiftKey); // updates the sprite array at the grid position with the color chosen on the palette
          _this.is_drawing = true; // needed for mousemove drawing
        }

        if (_this.mode == "fill") {
          _this.sprite.floodfill(_this.editor.get_pixel(e));
        }
        _this.update();
      });

      $('#editor').mousemove(function (e) {

        if (_this.is_drawing && _this.mode == "draw") {
          var newpos = _this.editor.get_pixel(e);
          // only draw if the mouse has entered a new pixel area (just for performance)
          if (newpos.x != _this.oldpos.x || newpos.y != _this.oldpos.y) {
            var all = _this.sprite.get_all();
            _this.sprite.set_pixel(newpos, e.shiftKey); // updates the sprite array at the grid position with the color chosen on the palette
            _this.editor.update(all);
            _this.preview.update(all);
            _this.list.update(all); // only updates the sprite drawn onto
            _this.oldpos = newpos;
          }
        }
      });

      $('#editor').mouseup(function (e) {
        // stop drawing pixels
        _this.is_drawing = false;
        _this.sprite.save_backup();
        _this.update();
      });

      $('#icon-shift-left').mouseup(function (e) {
        _this.sprite.shift_horizontal("left");
        _this.update();
      });

      $('#icon-shift-right').mouseup(function (e) {
        _this.sprite.shift_horizontal("right");
        _this.update();
      });

      $('#icon-shift-up').mouseup(function (e) {
        _this.sprite.shift_vertical("up");
        _this.update();
      });

      $('#icon-shift-down').mouseup(function (e) {
        _this.sprite.shift_vertical("down");
        _this.update();
      });

      $('#icon-flip-horizontal').mouseup(function (e) {
        _this.sprite.flip_horizontal();
        _this.update();
      });

      $('#icon-flip-vertical').mouseup(function (e) {
        _this.sprite.flip_vertical();
        _this.update();
      });

      $('#icon-multicolor').mouseup(function (e) {
        _this.sprite.toggle_multicolor();
        _this.update();
      });

      $('#icon-editor-zoom-in').mouseup(function (e) {
        _this.editor.zoom_in();
        _this.config.window_editor.zoom = _this.editor.get_zoom();
        _this.storage.write(_this.config);
        _this.update();
      });

      $('#icon-editor-zoom-out').mouseup(function (e) {
        _this.editor.zoom_out();
        _this.config.window_editor.zoom = _this.editor.get_zoom();
        _this.storage.write(_this.config);
        _this.update();
      });

      $('#icon-editor-grid').mouseup(function (e) {
        _this.editor.toggle_grid();
        _this.config.window_editor.grid = _this.editor.get_grid();
        _this.storage.write(_this.config);
        _this.update();
      });

      /*
      
      LLLLLLLLLLL                IIIIIIIIII      SSSSSSSSSSSSSSS    TTTTTTTTTTTTTTTTTTTTTTT
      L:::::::::L                I::::::::I    SS:::::::::::::::S   T:::::::::::::::::::::T
      L:::::::::L                I::::::::I   S:::::SSSSSS::::::S   T:::::::::::::::::::::T
      LL:::::::LL                II::::::II   S:::::S     SSSSSSS   T:::::TT:::::::TT:::::T
        L:::::L                    I::::I     S:::::S               TTTTTT  T:::::T  TTTTTT
        L:::::L                    I::::I     S:::::S                       T:::::T        
        L:::::L                    I::::I      S::::SSSS                    T:::::T        
        L:::::L                    I::::I       SS::::::SSSSS               T:::::T        
        L:::::L                    I::::I         SSS::::::::SS             T:::::T        
        L:::::L                    I::::I            SSSSSS::::S            T:::::T        
        L:::::L                    I::::I                 S:::::S           T:::::T        
        L:::::L         LLLLLL     I::::I                 S:::::S           T:::::T        
      LL:::::::LLLLLLLLL:::::L   II::::::II   SSSS        S:::::S         TT:::::::TT      
      L::::::::::::::::::::::L   I::::::::I   S::::::SSSSSS:::::S         T:::::::::T      
      L::::::::::::::::::::::L   I::::::::I   S:::::::::::::::SS          T:::::::::T      
      LLLLLLLLLLLLLLLLLLLLLLLL   IIIIIIIIII    SSSSSSSSSSSSSSS            TTTTTTTTTTT  
      
      */

      $('#spritelist').mouseup(function (e) {
        if (!_this.dragging) {
          _this.sprite.set_current_sprite(_this.list.get_clicked_sprite());
          if (!_this.sprite.is_multicolor() && _this.sprite.is_pen_multicolor()) {
            _this.sprite.set_pen("i");
          }
          _this.update();
        }
      });

      $("#spritelist").sortable({ stop: function stop(e, ui) {
          _this.sprite.sort_spritelist($("#spritelist").sortable("toArray"));
          _this.dragging = false;
          _this.list.update_all(_this.sprite.get_all());
          _this.update();
        }
      });

      $("#spritelist").sortable({ start: function start(e, ui) {
          _this.dragging = true;
        }
      });

      $('#icon-list-new').mouseup(function (e) {
        _this.sprite.new(_this.palette.get_color(), _this.sprite.is_multicolor());
        _this.list.update_all(_this.sprite.get_all());
        _this.update();
      });

      $('#icon-list-delete').mouseup(function (e) {
        _this.sprite.delete();
        _this.list.update_all(_this.sprite.get_all());
        _this.update();
      });

      $('#icon-list-copy').mouseup(function (e) {
        _this.sprite.copy();
        _this.update_ui();
        status("Sprite copied.");
      });

      $('#icon-list-paste').mouseup(function (e) {
        if (!_this.sprite.is_copy_empty()) {
          _this.sprite.paste();
          _this.update();
          status("Sprite pasted.");
        } else {
          status("Nothing to copy.", "error");
        }
      });

      $('#icon-list-grid').mouseup(function (e) {
        _this.list.toggle_grid();
        _this.list.update_all(_this.sprite.get_all());
        _this.update();
      });

      $('#icon-list-zoom-in').mouseup(function (e) {
        _this.list.zoom_in();
        _this.config.window_list.zoom = _this.list.get_zoom();
        _this.storage.write(_this.config);
        _this.list.update_all(_this.sprite.get_all());
        _this.update();
      });

      $('#icon-list-zoom-out').mouseup(function (e) {
        _this.list.zoom_out();
        _this.config.window_list.zoom = _this.list.get_zoom();
        _this.storage.write(_this.config);
        _this.list.update_all(_this.sprite.get_all());
        _this.update();
      });

      /*
      
      PPPPPPPPPPPPPPPPP     RRRRRRRRRRRRRRRRR     EEEEEEEEEEEEEEEEEEEEEE  VVVVVVVV           VVVVVVVV
      P::::::::::::::::P    R::::::::::::::::R    E::::::::::::::::::::E  V::::::V           V::::::V
      P::::::PPPPPP:::::P   R::::::RRRRRR:::::R   E::::::::::::::::::::E  V::::::V           V::::::V
      PP:::::P     P:::::P  RR:::::R     R:::::R  EE::::::EEEEEEEEE::::E  V::::::V           V::::::V
        P::::P     P:::::P    R::::R     R:::::R    E:::::E       EEEEEE   V:::::V           V:::::V 
        P::::P     P:::::P    R::::R     R:::::R    E:::::E                 V:::::V         V:::::V  
        P::::PPPPPP:::::P     R::::RRRRRR:::::R     E::::::EEEEEEEEEE        V:::::V       V:::::V   
        P:::::::::::::PP      R:::::::::::::RR      E:::::::::::::::E         V:::::V     V:::::V    
        P::::PPPPPPPPP        R::::RRRRRR:::::R     E:::::::::::::::E          V:::::V   V:::::V     
        P::::P                R::::R     R:::::R    E::::::EEEEEEEEEE           V:::::V V:::::V      
        P::::P                R::::R     R:::::R    E:::::E                      V:::::V:::::V       
        P::::P                R::::R     R:::::R    E:::::E       EEEEEE          V:::::::::V        
      PP::::::PP            RR:::::R     R:::::R  EE::::::EEEEEEEE:::::E           V:::::::V         
      P::::::::P            R::::::R     R:::::R  E::::::::::::::::::::E            V:::::V          
      P::::::::P            R::::::R     R:::::R  E::::::::::::::::::::E             V:::V           
      PPPPPPPPPP            RRRRRRRR     RRRRRRR  EEEEEEEEEEEEEEEEEEEEEE              VVV           
      
      */

      $('#icon-preview-x').mouseup(function (e) {
        _this.sprite.toggle_double_x();
        $('#icon-preview-x').toggleClass('icon-preview-x2-hi');
        _this.update();
      });

      $('#icon-preview-y').mouseup(function (e) {
        _this.sprite.toggle_double_y();
        $('#icon-preview-y').toggleClass('icon-preview-y2-hi');
        _this.update();
      });

      $('#icon-preview-zoom-in').mouseup(function (e) {
        _this.preview.zoom_in();
        _this.config.window_preview.zoom = _this.preview.get_zoom();
        _this.storage.write(_this.config);
        _this.update();
      });

      $('#icon-preview-zoom-out').mouseup(function (e) {
        _this.preview.zoom_out();
        _this.config.window_preview.zoom = _this.preview.get_zoom();
        _this.storage.write(_this.config);
        _this.update();
      });

      $('#icon-preview-overlay').mousedown(function (e) {
        _this.sprite.toggle_overlay();
        _this.update();
      });
    }
  }]);

  return App;
}();