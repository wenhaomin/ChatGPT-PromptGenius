/**
 * Author: Yan Lin, Haomin Wen
 * Created on: 2023-03-18
 * Listener functions.
 */

function languageSelectListenser() {
    let selected_lan_code = $('#language-select').find(':selected').val();
    cur_lan_code = selected_lan_code;
    switch_selected_language(selected_lan_code);
    render_page_basic(selected_lan_code);
    // render_all_prompt(selected_lan_code);
    console.log(cur_class, selected_lan_code);
    render_search_prompt_by_class(cur_class, selected_lan_code);
    render_class_tree(selected_lan_code);

}


function prompt_search_listener(){
    var search_text = $("#search-input").val();
    console.log(search_text);
    render_search_prompt_by_string(search_text, cur_lan_code)
}

function back_top_listener() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

function scroll_listenser() {
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 180) {
        $('#back-top-btn').removeClass('mdui-fab-hide');
    } else {
        $('#back-top-btn').addClass('mdui-fab-hide');
    }
}