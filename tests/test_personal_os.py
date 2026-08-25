import os, tempfile, unittest

class PersonalOSTest(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.NamedTemporaryFile(delete=False); self.tmp.close()
        os.environ['PERSONAL_OS_DB']=self.tmp.name
        os.environ['SEMICOLON_ADMIN_TOKEN']='test-token'
        import personal_os
        self.p=personal_os
    def tearDown(self):
        try: os.unlink(self.tmp.name)
        except OSError: pass
    def test_registry_and_memory(self):
        o=self.p.overview()
        self.assertIn('ada',[a['id'] for a in o['agents']])
        self.assertIn('beast',[a['id'] for a in o['agents']])
        m=self.p.memory({'title':'Test project','content':'Shared graph memory works.','project':'test'})
        self.assertTrue(m['id'].startswith('mem-'))
        self.assertEqual(len(self.p.graph()['nodes']),1)
    def test_task_requires_approval(self):
        t=self.p.task({'title':'Deploy','requires_approval':True})
        self.assertEqual(t['status'],'waiting_approval')
    def test_permission_auth(self):
        self.assertTrue(self.p.auth({'Authorization':'Bearer test-token'}))
        self.assertFalse(self.p.auth({'Authorization':'Bearer wrong'}))

if __name__=='__main__': unittest.main()
