/**
 * Author: Yan Lin
 * Created on: 2023-03-18
 * Initialize all dynamic elements on the page.
 */

init_language_select();
render_page_basic(cur_lan_code);
//render_class_display(cur_lan_code);
render_all_prompt(cur_lan_code);
render_class_tree(cur_lan_code);



/**
 * Author: Haomin Wen
 * Created on: 2023-03-24
 * Initialize hierarchy-tree.
 */
var inst = new mdui.Collapse('#hierarchy-tree');


$('#language-select').on('change', languageSelectListenser);


//$("home-btn").on('click', function() {
//    render_page_basic(cur_lan_code);
//    render_page_basic(cur_lan_code);
//    render_class_display(cur_lan_code);
//});


$("#search-btn").on('click', prompt_search_listener);

$(document).ready(function () {
        $("#search-input").keydown(function (e) {
            var curKey = e.which;
            if (curKey == 13) {
                console.log('enter')
                $("#search-btn").click();
                return false;
            }
        });
});
