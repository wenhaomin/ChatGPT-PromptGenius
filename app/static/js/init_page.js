/**
 * Author: Yan Lin, Haomin Wen
 * Created on: 2023-03-18
 * Initialize all dynamic elements on the page.
 */

init_language_select();
render_page_basic(cur_lan_code);
//render_class_display(cur_lan_code);
// render_all_prompt(cur_lan_code);
render_search_prompt_by_class('popular', cur_lan_code)
render_class_tree(cur_lan_code);




var inst = new mdui.Collapse('#hierarchy-tree');


window.onscroll = scroll_listenser;
$('#back-top-btn').on('click', back_top_listener);
$('#language-select').on('change', languageSelectListenser);
$("#search-btn").on('click', prompt_search_listener);

$('#submit-dialog-open-btn').on('click', submit_dialog_open_listener);
$('#submit-enter-btn').on('click', submit_enter_listener);
$('#submit-cancel-btn').on('click', function () { submit_dialog.close(); })

$(document).ready(function () {
    $("#search-input").keydown(function (e) {
        var curKey = e.which;
        if (curKey == 13) {
            console.log('enter')
            prompt_search_listener()
            // $("#search-btn").click();
            return false;
        }
    });
});
