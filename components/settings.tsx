"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";
import {
  exportDatabase,
  importDatabase,
  getDatabaseInfo,
} from "@/lib/database";
import { useApp } from "@/contexts/app-context";
import { useAuth } from "@/contexts/auth-context";
import { useSettings } from "@/contexts/settings-context";
import { useLanguage } from "@/contexts/language-context";
import showToast from "@/lib/toast";
import { COMPANY_DEFAULTS, CURRENCY, type CurrencyCode } from "@/lib/constants";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  SettingsIcon,
  User,
  Palette,
  DollarSign,
  Building,
  Database,
  Shield,
  LogOut,
  Eye,
  EyeOff,
  Plus,
  Edit,
  Trash2,
  Users,
  Languages,
} from "lucide-react";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { triggerRefresh } = useApp();
  const { language, setLanguage, t } = useLanguage();
  const {
    user,
    logout,
    updateProfile,
    changePassword,
    createAccount,
    updateAccount,
    deleteAccount,
    getAllAccounts,
    hasAccounts,
  } = useAuth();
  const { currency, setCurrency, getCurrencyInfo } = useSettings();

  const [companyInfo, setCompanyInfo] = useState(COMPANY_DEFAULTS);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Account management state
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [currentAccountId, setCurrentAccountId] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [accountFormData, setAccountFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user" as "admin" | "user",
  });
  const [showAccountPassword, setShowAccountPassword] = useState({
    password: false,
    confirm: false,
  });

  // Database info state
  const [databaseInfo, setDatabaseInfo] = useState<{
    type: string;
    location: string;
    persistent: boolean;
    secure: boolean;
  } | null>(null);

  useEffect(() => {
    const storedInfo = localStorage.getItem("company_info");
    if (storedInfo) {
      setCompanyInfo(JSON.parse(storedInfo));
    }
    loadAccounts();
    loadDatabaseInfo();
  }, []);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  const loadAccounts = () => {
    const allAccounts = getAllAccounts();
    setAccounts(allAccounts);
  };

  const loadDatabaseInfo = async () => {
    try {
      const info = await getDatabaseInfo();
      setDatabaseInfo(info);
    } catch (error) {
      console.error("Failed to load database info:", error);
    }
  };

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  const handleLanguageChange = (newLanguage: "en" | "fr") => {
    setLanguage(newLanguage);
    showToast.success(
      t("messages.languageChanged"),
      `Language changed to ${newLanguage === "en" ? "English" : "Français"}`,
    );
  };

  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    setCurrency(newCurrency);
    showToast.success(
      t("messages.currencyUpdated"),
      `${t("settings.currency.current")}: ${CURRENCY[newCurrency].NAME}`,
    );
  };

  const handleExportDatabase = async () => {
    try {
      await exportDatabase();
      showToast.success("Export Successful", "Database exported successfully");
    } catch (error) {
      console.error("Failed to export database:", error);
      showToast.error("Export Failed", "Failed to export database");
    }
  };

  const handleImportDatabase = async () => {
    try {
      await importDatabase();
      showToast.success("Import Successful", "Database imported successfully");
      triggerRefresh();
      window.location.reload();
    } catch (error) {
      console.error("Failed to import database:", error);
      showToast.error("Import Failed", "Failed to import database");
    }
  };

  const handleCompanyInfoChange = (field: string, value: string) => {
    setCompanyInfo((prev) => ({ ...prev, [field]: value }));
  };

  const saveCompanyInfo = () => {
    localStorage.setItem("company_info", JSON.stringify(companyInfo));
    showToast.success(
      t("messages.settingsSaved"),
      t("settings.company.description"),
    );
  };

  const handleProfileUpdate = async () => {
    if (!user) return;
    if (!profileData.name.trim() || !profileData.email.trim()) {
      showToast.error("Invalid Input", "Name and email are required");
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile(profileData.name, profileData.email);
      showToast.success(
        t("messages.profileUpdated"),
        "Your profile has been updated successfully",
      );
    } catch (error) {
      showToast.error(
        "Update Failed",
        error instanceof Error ? error.message : "Failed to update profile",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!user) return;
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      showToast.error("Missing Fields", "All password fields are required");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast.error("Password Mismatch", "New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showToast.error(
        "Password Too Short",
        "New password must be at least 6 characters long",
      );
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
      );
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      showToast.success(
        t("messages.passwordChanged"),
        "Your password has been updated successfully",
      );
    } catch (error) {
      showToast.error(
        "Password Change Failed",
        error instanceof Error ? error.message : "Failed to change password",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    showToast.success("Logged Out", "You have been successfully logged out");
  };

  // Account management functions
  const openAccountModal = (account?: any) => {
    if (account) {
      setIsEditingAccount(true);
      setCurrentAccountId(account.id);
      setAccountFormData({
        name: account.name,
        email: account.email,
        password: "",
        confirmPassword: "",
        role: account.role,
      });
    } else {
      setIsEditingAccount(false);
      setCurrentAccountId(null);
      setAccountFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "user",
      });
    }
    setIsAccountModalOpen(true);
  };

  const handleAccountSubmit = async () => {
    if (!accountFormData.name.trim() || !accountFormData.email.trim()) {
      showToast.error("Invalid Input", "Name and email are required");
      return;
    }

    if (!isEditingAccount) {
      if (!accountFormData.password || !accountFormData.confirmPassword) {
        showToast.error(
          "Missing Password",
          "Password is required for new accounts",
        );
        return;
      }

      if (accountFormData.password !== accountFormData.confirmPassword) {
        showToast.error("Password Mismatch", "Passwords don't match");
        return;
      }

      if (accountFormData.password.length < 6) {
        showToast.error(
          "Password Too Short",
          "Password must be at least 6 characters long",
        );
        return;
      }
    }

    setIsLoading(true);
    try {
      if (isEditingAccount && currentAccountId) {
        await updateAccount(
          currentAccountId,
          accountFormData.email,
          accountFormData.name,
          accountFormData.role,
        );
        showToast.success(
          t("messages.accountUpdated"),
          "Account has been updated successfully",
        );
      } else {
        await createAccount(
          accountFormData.email,
          accountFormData.password,
          accountFormData.name,
          accountFormData.role,
        );
        showToast.success(
          t("messages.accountCreated"),
          "New account has been created successfully",
        );
      }
      setIsAccountModalOpen(false);
      loadAccounts();
    } catch (error) {
      showToast.error(
        "Operation Failed",
        error instanceof Error ? error.message : "Failed to save account",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = (accountId: string) => {
    setAccountToDelete(accountId);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteAccount = async () => {
    if (!accountToDelete) return;

    setIsLoading(true);
    try {
      await deleteAccount(accountToDelete);
      showToast.success(
        t("messages.accountDeleted"),
        "Account has been deleted successfully",
      );
      loadAccounts();
    } catch (error) {
      showToast.error(
        "Delete Failed",
        error instanceof Error ? error.message : "Failed to delete account",
      );
    } finally {
      setIsLoading(false);
      setIsDeleteConfirmOpen(false);
      setAccountToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="space-y-6 p-6">
        <div className="animate-in fade-in-down">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold gradient-text flex items-center gap-3">
                <SettingsIcon className="h-8 w-8" />
                {t("settings.title")}
              </h1>
              <p className="text-muted-foreground mt-2">
                {t("settings.description")}
              </p>
            </div>
            {hasAccounts && user && (
              <Button
                variant="outline"
                onClick={handleLogout}
                className="btn-enhanced hover:bg-red-50 hover:border-red-200 hover:text-red-600 bg-transparent"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t("common.logout")}
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="accounts" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="accounts">
              {t("settings.tabs.accounts")}
            </TabsTrigger>
            {user && (
              <TabsTrigger value="profile">
                {t("settings.tabs.profile")}
              </TabsTrigger>
            )}
            {user && (
              <TabsTrigger value="security">
                {t("settings.tabs.security")}
              </TabsTrigger>
            )}
            <TabsTrigger value="appearance">
              {t("settings.tabs.appearance")}
            </TabsTrigger>
            <TabsTrigger value="language">
              {t("settings.tabs.language")}
            </TabsTrigger>
            <TabsTrigger value="currency">
              {t("settings.tabs.currency")}
            </TabsTrigger>
            <TabsTrigger value="company">
              {t("settings.tabs.company")}
            </TabsTrigger>
            <TabsTrigger value="database">
              {t("settings.tabs.database")}
            </TabsTrigger>
          </TabsList>

          {/* Accounts Tab */}
          <TabsContent value="accounts" className="space-y-4">
            <Card className="card-enhanced">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {t("settings.accounts.title")}
                    </CardTitle>
                    <CardDescription>
                      {t("settings.accounts.description")}
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => openAccountModal()}
                    className="btn-enhanced"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t("settings.accounts.addAccount")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {accounts.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      {t("settings.accounts.noAccounts")}
                    </p>
                    <Button
                      onClick={() => openAccountModal()}
                      className="btn-enhanced"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {t("settings.accounts.createFirst")}
                    </Button>
                  </div>
                ) : (
                  <div className="table-enhanced">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("settings.accounts.name")}</TableHead>
                          <TableHead>{t("settings.accounts.email")}</TableHead>
                          <TableHead>{t("settings.accounts.role")}</TableHead>
                          <TableHead>
                            {t("settings.accounts.created")}
                          </TableHead>
                          <TableHead className="text-right">
                            {t("settings.accounts.actions")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accounts.map((account) => (
                          <TableRow key={account.id}>
                            <TableCell className="font-medium">
                              {account.name}
                            </TableCell>
                            <TableCell>{account.email}</TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  account.role === "admin"
                                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                                    : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                }`}
                              >
                                {t(`settings.accounts.${account.role}`)}
                              </span>
                            </TableCell>
                            <TableCell>
                              {new Date(account.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => openAccountModal(account)}
                                  className="btn-enhanced hover:bg-blue-50 hover:border-blue-200"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() =>
                                    handleDeleteAccount(account.id)
                                  }
                                  className="btn-enhanced hover:bg-red-50 hover:border-red-200"
                                  disabled={accounts.length === 1}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          {user && (
            <TabsContent value="profile" className="space-y-4">
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {t("settings.profile.title")}
                  </CardTitle>
                  <CardDescription>
                    {t("settings.profile.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="profile-name">
                        {t("settings.profile.fullName")}
                      </Label>
                      <Input
                        id="profile-name"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="input-enhanced"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-email">
                        {t("settings.accounts.email")}
                      </Label>
                      <Input
                        id="profile-email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="input-enhanced"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleProfileUpdate}
                    disabled={isLoading}
                    className="btn-enhanced"
                  >
                    {isLoading
                      ? "Updating..."
                      : t("settings.profile.updateProfile")}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Security Tab */}
          {user && (
            <TabsContent value="security" className="space-y-4">
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    {t("settings.security.title")}
                  </CardTitle>
                  <CardDescription>
                    {t("settings.security.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">
                        {t("settings.security.currentPassword")}
                      </Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              currentPassword: e.target.value,
                            }))
                          }
                          className="input-enhanced pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() =>
                            setShowPasswords((prev) => ({
                              ...prev,
                              current: !prev.current,
                            }))
                          }
                        >
                          {showPasswords.current ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">
                          {t("settings.security.newPassword")}
                        </Label>
                        <div className="relative">
                          <Input
                            id="new-password"
                            type={showPasswords.new ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) =>
                              setPasswordData((prev) => ({
                                ...prev,
                                newPassword: e.target.value,
                              }))
                            }
                            className="input-enhanced pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() =>
                              setShowPasswords((prev) => ({
                                ...prev,
                                new: !prev.new,
                              }))
                            }
                          >
                            {showPasswords.new ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">
                          {t("settings.security.confirmNewPassword")}
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirm-password"
                            type={showPasswords.confirm ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                              setPasswordData((prev) => ({
                                ...prev,
                                confirmPassword: e.target.value,
                              }))
                            }
                            className="input-enhanced pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() =>
                              setShowPasswords((prev) => ({
                                ...prev,
                                confirm: !prev.confirm,
                              }))
                            }
                          >
                            {showPasswords.confirm ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={handlePasswordChange}
                    disabled={isLoading}
                    className="btn-enhanced"
                  >
                    {isLoading
                      ? "Changing..."
                      : t("settings.security.changePassword")}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-4">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  {t("settings.appearance.title")}
                </CardTitle>
                <CardDescription>
                  {t("settings.appearance.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label
                      htmlFor="dark-mode"
                      className="text-base font-medium"
                    >
                      {t("settings.appearance.darkMode")}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t("settings.appearance.darkModeDesc")}
                    </p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={theme === "dark"}
                    onCheckedChange={handleThemeToggle}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Language Tab */}
          <TabsContent value="language" className="space-y-4">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  {t("settings.language.title")}
                </CardTitle>
                <CardDescription>
                  {t("settings.language.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language-select">
                    {t("settings.language.select")}
                  </Label>
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="input-enhanced">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">
                        <div className="flex items-center gap-2">
                          <span>🇺🇸</span>
                          {t("settings.language.english")}
                        </div>
                      </SelectItem>
                      <SelectItem value="fr">
                        <div className="flex items-center gap-2">
                          <span>🇫🇷</span>
                          {t("settings.language.french")}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Currency Tab */}
          <TabsContent value="currency" className="space-y-4">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  {t("settings.currency.title")}
                </CardTitle>
                <CardDescription>
                  {t("settings.currency.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">
                      {t("settings.tabs.currency")}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t("settings.currency.current")}: {getCurrencyInfo().NAME}{" "}
                      ({getCurrencyInfo().CODE})
                    </p>
                  </div>
                  <div className="text-2xl font-bold">
                    {getCurrencyInfo().SYMBOL}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency-select">
                    {t("settings.currency.select")}
                  </Label>
                  <Select value={currency} onValueChange={handleCurrencyChange}>
                    <SelectTrigger className="input-enhanced">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CURRENCY).map(([code, info]) => (
                        <SelectItem key={code} value={code}>
                          {info.SYMBOL} {info.NAME} ({info.CODE})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company Tab */}
          <TabsContent value="company" className="space-y-4">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  {t("settings.company.title")}
                </CardTitle>
                <CardDescription>
                  {t("settings.company.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">
                      {t("settings.company.name")}
                    </Label>
                    <Input
                      id="company-name"
                      value={companyInfo.name}
                      onChange={(e) =>
                        handleCompanyInfoChange("name", e.target.value)
                      }
                      className="input-enhanced"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-email">
                      {t("settings.accounts.email")}
                    </Label>
                    <Input
                      id="company-email"
                      type="email"
                      value={companyInfo.email}
                      onChange={(e) =>
                        handleCompanyInfoChange("email", e.target.value)
                      }
                      className="input-enhanced"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-phone">
                      {t("settings.company.phone")}
                    </Label>
                    <Input
                      id="company-phone"
                      value={companyInfo.phone}
                      onChange={(e) =>
                        handleCompanyInfoChange("phone", e.target.value)
                      }
                      className="input-enhanced"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-address">
                      {t("settings.company.address")}
                    </Label>
                    <Input
                      id="company-address"
                      value={companyInfo.address}
                      onChange={(e) =>
                        handleCompanyInfoChange("address", e.target.value)
                      }
                      className="input-enhanced"
                    />
                  </div>
                </div>
                <Button onClick={saveCompanyInfo} className="btn-enhanced">
                  {t("settings.company.save")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-4">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  {t("settings.database.title")}
                </CardTitle>
                <CardDescription>
                  {t("settings.database.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Database Information */}
                {databaseInfo && (
                  <div className="bg-muted/50 p-4 rounded-lg border">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Database Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">
                          Type:
                        </span>
                        <p className="mt-1">
                          {databaseInfo.type}
                          {databaseInfo.type === "SQLite" && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              Persistent
                            </span>
                          )}
                          {databaseInfo.type === "localStorage" && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                              Temporary
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">
                          Storage:
                        </span>
                        <p className="mt-1 break-all">
                          {databaseInfo.location}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">
                          Data Safety:
                        </span>
                        <p className="mt-1">
                          {databaseInfo.persistent ? (
                            <span className="text-green-600 dark:text-green-400">
                              ✓ Data survives app reinstalls
                            </span>
                          ) : (
                            <span className="text-yellow-600 dark:text-yellow-400">
                              ⚠ Data may be lost
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">
                          Security:
                        </span>
                        <p className="mt-1">
                          {databaseInfo.secure ? (
                            <span className="text-green-600 dark:text-green-400">
                              ✓ Local file system
                            </span>
                          ) : (
                            <span className="text-blue-600 dark:text-blue-400">
                              Browser storage
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    {databaseInfo.type === "SQLite" && (
                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800">
                        <p className="text-sm text-green-800 dark:text-green-200">
                          <strong>✓ Enhanced Protection:</strong> Your data is
                          stored in a SQLite database in your Documents folder
                          and will persist even if you uninstall this
                          application.
                        </p>
                      </div>
                    )}
                    {databaseInfo.type === "localStorage" && (
                      <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded border border-yellow-200 dark:border-yellow-800">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          <strong>⚠ Browser Storage:</strong> Your data is
                          stored in browser storage. Consider exporting your
                          data regularly and upgrading to the Electron app for
                          better data persistence.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="outline"
                    onClick={handleExportDatabase}
                    className="btn-enhanced bg-transparent"
                  >
                    {t("settings.database.export")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleImportDatabase}
                    className="btn-enhanced bg-transparent"
                  >
                    {t("settings.database.import")}
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  <p className="font-medium mb-1">
                    {t("settings.database.important")}
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>{t("settings.database.exportDesc")}</li>
                    <li>{t("settings.database.importDesc")}</li>
                    <li>{t("settings.database.backupDesc")}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Account Modal */}
        <Dialog open={isAccountModalOpen} onOpenChange={setIsAccountModalOpen}>
          <DialogContent className="animate-in scale-in">
            <DialogHeader>
              <DialogTitle>
                {isEditingAccount
                  ? t("settings.accounts.editAccount")
                  : t("settings.accounts.createAccount")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account-name">
                    {t("settings.profile.fullName")}
                  </Label>
                  <Input
                    id="account-name"
                    value={accountFormData.name}
                    onChange={(e) =>
                      setAccountFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="input-enhanced"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-email">
                    {t("settings.accounts.email")}
                  </Label>
                  <Input
                    id="account-email"
                    type="email"
                    value={accountFormData.email}
                    onChange={(e) =>
                      setAccountFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="input-enhanced"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-role">
                  {t("settings.accounts.role")}
                </Label>
                <Select
                  value={accountFormData.role}
                  onValueChange={(value: "admin" | "user") =>
                    setAccountFormData((prev) => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger className="input-enhanced">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      {t("settings.accounts.user")}
                    </SelectItem>
                    <SelectItem value="admin">
                      {t("settings.accounts.admin")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!isEditingAccount && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="account-password">
                      {t("settings.accounts.password")}
                    </Label>
                    <div className="relative">
                      <Input
                        id="account-password"
                        type={
                          showAccountPassword.password ? "text" : "password"
                        }
                        value={accountFormData.password}
                        onChange={(e) =>
                          setAccountFormData((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        className="input-enhanced pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() =>
                          setShowAccountPassword((prev) => ({
                            ...prev,
                            password: !prev.password,
                          }))
                        }
                      >
                        {showAccountPassword.password ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account-confirm-password">
                      {t("settings.accounts.confirmPassword")}
                    </Label>
                    <div className="relative">
                      <Input
                        id="account-confirm-password"
                        type={showAccountPassword.confirm ? "text" : "password"}
                        value={accountFormData.confirmPassword}
                        onChange={(e) =>
                          setAccountFormData((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        className="input-enhanced pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() =>
                          setShowAccountPassword((prev) => ({
                            ...prev,
                            confirm: !prev.confirm,
                          }))
                        }
                      >
                        {showAccountPassword.confirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAccountModalOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handleAccountSubmit}
                disabled={isLoading}
                className="btn-enhanced"
              >
                {isLoading
                  ? "Saving..."
                  : isEditingAccount
                    ? t("common.update")
                    : t("common.create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          onConfirm={confirmDeleteAccount}
          title={t("common.delete") + " Account"}
          description={t("settings.accounts.deleteConfirm")}
          confirmText={t("common.delete")}
        />
      </div>
    </div>
  );
}
