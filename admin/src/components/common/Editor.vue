<template>
    <div class="editor">
        <input type="text" class="title" id="title" v-model="title" @input="autosave">
        <div class="operate-bar" v-show="id && $route.path === '/list'">
            <section class="tag-container">
                 <svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-biaoqian"></use>
                </svg>
                <ul class="tags">
                    <li class="tag" v-for="(tag,index) in getTags" :key="index">
                        {{tag}}
                        <sup @click="deleteTag(index)"> x </sup>
                    </li>
                </ul>
                <input v-if="showTags" type="text" class="tag-input" id="tag-input" @keydown.enter="addTag">
                <span v-else class="tag-add" @click="addTag">+</span>
            </section>
            <section class="btn-container">
                <button id="delete" class="delete">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#icon-shanchu"></use>
                    </svg>
                    <span @click="deleteArticle">删除文章</span>
                </button>
                <button id="submit" class="not-del">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#icon-article"></use>
                    </svg>
                    <span @click="publishArticle">发布文章</span>
                </button>
            </section>
        </div>
        <p class="tips">标签查询页面只能批量更改标签 修改的文章内容会自动保存</p>
        <div class="content">
            <textarea></textarea>
        </div>
    </div>
</template>

<script>
// 引入编辑器
import 'simplemde/dist/simplemde.min.css'
import SimpleMDE from 'simplemde'
// 引入全局的数据
import { mapState, mapGetters } from 'vuex'
//引入request发请求
import request from '@/utils/request'
// 引入debounce方法
import debounce from 'lodash.debounce'
export default {
    name:'Editor',
    data() {
        return {
            showTags: false,
            simplemde:'',//编辑器
        }
    },
    computed:{
        ...mapState(['id','tags','content','isPublished']),
        ...mapGetters(['getTags']),
         // 因为这个title是数据双向绑定 因此 它可能会被改变 如果我们直接从mapState中读取它的话 那么如果改变title的话 又因为它没有setter的话 就会导致无法直接改变state中的title
        title:{
            get(){
                return this.$store.state.title
            },
            set(value){
                // console.log(value);
                this.$store.commit('SET_TITLE',value);
            }
        }
    },
    mounted() {
        this.simplemde = new SimpleMDE({
            placeholder:'talk to me,what are you say..',
            spellChecker:false,
            toolbarTips:false
        });
        // 将vuex里面的正在编辑的文章的相关信息输出到编辑器里面去
            this.simplemde.value(this.content)
            // 绑定编辑器的按键事件以及复制 粘贴的事件发生
            this.simplemde.codemirror.on('keyHandle',()=>this.autosave())
            this.simplemde.codemirror.on('inputRead',()=>this.autosave())
    },
    // 监控ID值的变化 如果一旦发生变化 就直接将内容变化
    watch:{
        id(newVal,oldVal){
            this.simplemde.value(this.content)
        }
    },
    methods:{
        //避免发请求的次数过多....
        autosave:debounce(function(){
            if(this.id){
                this.$store.dispatch('saveArticle',{
                    id:this.id,
                    title:this.title,
                    tags:this.getTags.join(','),
                    content:this.simplemde.value(),
                    isPublished:this.isPublished
                })
            }
        },1000),
        // 删除标签
        deleteTag(index){
            this.getTags.splice(index,1);
            this.autosave();
        },
        // 添加标签
        addTag(){
            // input显示的时候，会执行这个
            if(this.showTags){
                const newTag = document.querySelector('#tag-input').value
                if(newTag && this.getTags.indexOf(newTag) === -1){
                    this.getTags.push(newTag);
                    // 每次按下enter键的时候自动保存
                    this.autosave();
                }
            }
            // 只是一个单纯的切换功能，第一点击+号的时候会显示input表单，按enter键会隐藏
            this.showTags = !this.showTags
        },
        // 删除文章
        deleteArticle(){
            request({
                url:`/articles/${this.id}`,
                method:'delete',
                data:{}
            }).then(res=>{
                // 删除之后需要更新视图，让全局中的数据为空
                this.$store.commit('SET_DELETE_ARTICLE')
            }).catch(err=>{
                console.log(err);
            })
        },
        //发布文章
        publishArticle(){
            if(!this.isPublished){
                request({
                    url:`/articles/publish/${this.id}`,
                    method:'put',
                    date:{}
                }).then(res=>{
                    // console.log(res);
                    this.$store.commit('SET_PUBLISH_STATE')
                }).catch(err=>{
                    console.log(err);
                })
            }
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/style/variable";
.title {
    margin-bottom: 0.3em;
    width: 100%;
    height: 2em;
    border: none;
    font-size: 2.4rem;
    color: $title;
    outline: none;
    border-bottom: 1px solid $special;
    background: none;
    text-align: center;
}
.operate-bar {
    @include flex($justify: space-between);
    height: 4em;
    font-size: 1.3rem;
    margin-bottom: 1em;
    .tag-container {
        @include flex($justify: flex-start);
        .icon {
            width: 1.2em;
            height: 1.2em;
            margin-right: 10px;
        }
        .tags {
            @include flex;
            list-style: none;
            margin-right: 10px;
            padding: 0;
            .tag {
                margin-right: 10px;
                color: $base;
                position: relative;
                &:last-child {
                    margin-right: 0px;
                }
            }

        }
        .tag-add {
            font: {
                weight: 600;
                size: 1.6rem;
            }
            color: $special;
            text-decoration: underline;
            cursor: pointer;
        }
    }
}
.tips {
    color: $base;
    text-align: center;
    font-size: 1.2em;
}
.content {
    font-size: 1.6rem;
}
// .btn-container {
//     .delete {
//         color: #fff;
//         background-color: $base;
//     }
// }
</style>

