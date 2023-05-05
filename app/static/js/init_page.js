/**
 * Author: Yan Lin, Haomin Wen
 * Created on: 2023-03-18
 * Initialize all dynamic elements on the page.
 */

(async () => {
    await init_language_select();
    await render_class_tree(cur_lan_code);

    await render_page_basic(cur_lan_code);
    await render_search_prompt_by_class(cur_selected_class, cur_lan_code);
    await render_tools(cur_lan_code);
})().then(() => {
    window.onscroll = scroll_listenser;
    $('#back-top-btn').on('click', back_top_listener);
    $("#search-input-group button").on('click', prompt_search_listener);

    $('#submit-clear-btn').on('click', submit_clear_listener);
    $('#submit-enter-btn').on('click', submit_enter_listener);

    $(document).ready(function () {
        $("#search-input-group input").keydown(function (e) {
            var curKey = e.which;
            if (curKey == 13) {
                prompt_search_listener()
                return false;
            }
        });
    });
})
