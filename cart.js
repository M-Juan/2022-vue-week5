import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';


Object.keys(VeeValidateRules).forEach(rule => {
    if (rule !== 'default') {
      VeeValidate.defineRule(rule, VeeValidateRules[rule]);
    }
  });

// 讀取外部的資源
VeeValidateI18n.loadLocaleFromURL('./zh_TW.json');

// Activate the locale
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize('zh_TW'),
  validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});

const url = 'https://vue3-course-api.hexschool.io/v2'; 
const path = 'mjweek2';

const productModal={
    props:['id','addToCart','openModal'],
    data(){
        return{
            modal:{},
            tempProduct:{},
            qty:1,
        }
    },
    template:'#userProductModal',
    mounted(){
        this.modal=new bootstrap.Modal(this.$refs.modal)

        this.$refs.modal.addEventListener('hidden.bs.modal', event => {
            this.openModal("")
        })//監聽DOM 當MODAL關閉時觸發→清空ID→確保下次可再觸發
        // this.modal.show();
    },
    //監聽props傳入的值，當id有變動取得遠端資料(單一產品)，並呈現modal
    watch:{
        id(){
            if(this.id){
                axios.get(`${url}/api/${path}/product/${this.id}`)
                .then((res)=>{
                    // console.log('單一產品：',res.data.product);
                    this.tempProduct=res.data.product;
                    this.modal.show()
                })
                .catch((err)=>{
                    alert(err.data.message)
                })
            }

        }

    },
    methods:{
        hide(){
            this.modal.hide()
        }
    }
};

const app=Vue.createApp({
    data(){
        return{
            products:[],
            productId:'',
            cart:{},
            loadingItem:'',//存id
            form: {
                user: {
                  name: '',
                  email: '',
                  tel: '',
                  address: '',
                },
                message: '',
            },
            isLoading:false,
            
        }
    },
    methods:{
        //取得產品列表
        getProducts(){
            axios.get(`${url}/api/${path}/products/all`)
            .then((res)=>{
                this.products=res.data.products;
            })
            .catch((err)=>{
                alert(err.data.message)
            })
        },
        //打開單一產品模板
        openModal(id){
            this.productId=id;
        },
        //將產品將加入購物車
        addToCart(product_id,qty=1){
            const data={
                product_id,
                qty
            }
            axios.post(`${url}/api/${path}/cart`,{data})
            .then((res)=>{
                alert(`成功加入購物車`)
                this.$refs.productModal.hide();
                this.getCarts();//品項加入購物車也要更新購物車列表
            })
            .catch((err)=>{
                alert(err.data.message)
            })
        },
        //取得購物車列表
        getCarts(){
            axios.get(`${url}/api/${path}/cart`)
            .then((res)=>{
                this.cart=res.data.data
            })
            .catch((err)=>{
                alert(err.data.message)
            })
        },
        //更改購物車內容
        updateCartItem(item){
            const data={
                "product_id": item.product_id,
                "qty": item.qty,
            }
            this.loadingItem=item.id
            axios.put(`${url}/api/${path}/cart/${item.id}`,{data})
            .then((res)=>{
                alert(res.data.message)
                this.getCarts();
                this.loadingItem='';
            })
            .catch((err)=>{
                alert(err.data.message)
            }) 
        },

        //刪除購物車單一品項
        deleteItem(item){
            this.loadingItem=item.id
            axios.delete(`${url}/api/${path}/cart/${item.id}`)
            .then((res)=>{
                alert(res.data.message)
                this.getCarts();
                this.loadingItem='';
            })
            .catch((err)=>{
                alert(err.data.message)
            }) 
        },

        //刪除購物車所有品項
        deleteCart(){
            axios.delete(`${url}/api/${path}/carts`)
            .then((res)=>{
                alert(res.data.message)
                this.getCarts();
            })
            .catch((err)=>{
                alert(err.data.message)
            }) 
        },
        createOrder(){
            const order=this.form;
            axios.post(`${url}/api/${path}/order`,{data:order})
            .then((res)=>{
                alert(res.data.message)
                this.$refs.form.resetForm();
                this.getCarts();
            })
            .catch((err)=>{
                alert(err.data.message)
            }) 
        }


    },
    mounted(){
        this.getProducts();
        this.getCarts();
        this.isLoading = true;
        setTimeout(() => {
          this.isLoading = false;
        }, 1000);

    },
    components:{productModal}

});

app.component('loading', VueLoading.Component)
app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);

app.mount('#app')