<template>
    <div style="height:100%;">
        <head-nav></head-nav>
        <Aside></Aside>
        <div class="list-container main">
            <h2>文章列表 /
                <span>ARTICLE LIST</span>
            </h2>
            <hr>
            <main>
                <div class="article-list">
                    <section class="btn-container">
                        <button id="add" class="not-del" @click="AddArticle">
                          <svg class="icon" aria-hidden="true">
                            <use xlink:href="#icon-article"></use>
                          </svg>
                          <span>新文章</span>
                        </button>
                    </section>
                    <!-- 文章列表的组件 -->
                    <article-list ref="articleList"></article-list>
                </div>
                <!-- 编译器的组件 -->
                <editor></editor>
            </main>
        </div>
    </div>

</template>

<script>
// 引入头部和侧边导航组件
import HeadNav from '@/components/common/HeadNav'
import Aside from '@/components/common/Aside'
import ArticleList from "@/components/common/ArticleList";
import Editor from "@/components/common/Editor";
import request from '@/utils/request'
export default {
  name: "List",
  data: function() {
    return {
      ArticleList: []
    };
  },
  components: {
    HeadNav,
    Aside,
    ArticleList,
    Editor
  },
  methods: {
    // 发表文章的方法
    AddArticle: function() {
      request({
        url:'/articles/add',
        method:'post',
        data:{}
      }).then(res=>{
        // console.log(res);
        // location.reload();
        // 获取到插入文章的id值
        const addId = res.insertId;
        // 2.调用子组件中的updateList方法来更新文章列表
        this.$refs.articleList.updateList(addId);
      }).catch(err=>{
        console.log(err);
      })
    }
  }
};
</script>

<style lang="scss" type="text/scss" scoped>
@import "../assets/style/variable";
main {
  @include flex($justify: space-between);
  height: calc(100% - 48px);
  padding: 0.5em 0;
}

.article-list {
  width: 40%;
  height: 100%;
  overflow: auto;
  padding: 0 0.8em 0.5em 0;
  .list {
    // margin: 0;
    padding: 0;
    list-style: none;
  }
}

.editor {
  width: 58%;
  height: 100%;
  padding: 0 0.8em 0.5em 0;
  overflow: auto;
}
</style>
